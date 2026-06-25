<?php
defined('ABSPATH') or die('No script kiddies please!');
if (!class_exists('devvn_reviews_auto_update')) {
    class devvn_reviews_auto_update
    {
        const GITHUB_REPO = 'devvn-woocommerce-reviews';
        const GITHUB_BRANCH = 'main';

        /**
         * The plugin current version
         * @var string
         */
        public $current_version;

        /**
         * The plugin remote update path
         * @var string
         */
        public $update_path;

        /**
         * Plugin Slug (plugin_directory/plugin_file.php)
         * @var string
         */
        public $plugin_slug;

        /**
         * Plugin name (plugin_file)
         * @var string
         */
        public $slug;

        public $download_link;

        /**
         * Initialize a new instance of the WordPress Auto-Update class
         * @param string $current_version
         * @param string $update_path
         * @param string $plugin_slug
         */
        function __construct($current_version, $update_path, $plugin_slug)
        {
            $this->current_version = $current_version;
            $this->update_path = $update_path;
            $this->plugin_slug = $plugin_slug;

            list($t1, $t2) = explode('/', $plugin_slug);
            $this->slug = str_replace('.php', '', $t2);

            $this->download_link = sprintf(
                'https://github.com/itvn9online/%s/archive/refs/heads/%s.zip',
                self::GITHUB_REPO,
                self::GITHUB_BRANCH
            );

            add_filter('pre_set_site_transient_update_plugins', array(&$this, 'check_update'));
            add_filter('plugins_api', array(&$this, 'check_info'), 10, 3);
            add_filter('upgrader_source_selection', array(&$this, 'upgrader_source_selection'), 10, 4);
            add_filter('upgrader_post_install', array(&$this, 'upgrader_post_install'), 10, 3);
        }

        /**
         * Normalize plugin folder name by removing GitHub zip "-main" suffix.
         *
         * @param string $folder
         * @return string
         */
        private function normalize_plugin_folder($folder)
        {
            return preg_replace('/-main$/', '', $folder);
        }

        /**
         * @param array $hook_extra
         * @return bool
         */
        private function is_our_plugin_update($hook_extra)
        {
            if (empty($hook_extra['plugin'])) {
                return false;
            }

            $hook_folder = dirname($hook_extra['plugin']);
            $our_folder = dirname($this->plugin_slug);

            return $this->normalize_plugin_folder($hook_folder) === $this->normalize_plugin_folder($our_folder);
        }

        /**
         * Add our self-hosted autoupdate plugin to the filter transient
         *
         * @param $transient
         * @return object $ transient
         */
        public function check_update($transient)
        {
            if (empty($transient->checked)) {
                return $transient;
            }

            $remote_version = $this->getGithub_version();
            if (!$remote_version) {
                return $transient;
            }

            $remote_infor = $this->getGithub_information();

            if (version_compare($this->current_version, $remote_version, '<')) {
                $obj = new stdClass();
                $obj->slug = $this->slug;
                $obj->new_version = $remote_version;
                $obj->url = $remote_infor->download_link;
                $obj->package = $remote_infor->download_link;
                $transient->response[$this->plugin_slug] = $obj;
            }

            return $transient;
        }

        /**
         * Add our self-hosted description to the filter
         *
         * @param boolean $false
         * @param array $action
         * @param object $arg
         * @return bool|object
         */
        public function check_info($false, $action, $arg)
        {
            if ($action !== 'plugin_information') {
                return false;
            }

            if ($arg->slug == $this->slug) {
                return $this->getGithub_information();
            }

            return false;
        }

        /**
         * Rename extracted GitHub folder (repo-main) to plugin folder without "-main".
         *
         * @param string $source
         * @param string $remote_source
         * @param WP_Upgrader $upgrader
         * @param array $hook_extra
         * @return string|WP_Error
         */
        public function upgrader_source_selection($source, $remote_source, $upgrader, $hook_extra)
        {
            if (!$this->is_our_plugin_update($hook_extra)) {
                return $source;
            }

            global $wp_filesystem;

            $plugin_folder = basename(untrailingslashit($source));
            $correct_folder = $this->normalize_plugin_folder($plugin_folder);

            if ($plugin_folder === $correct_folder) {
                return $source;
            }

            $new_source = trailingslashit(dirname($source)) . $correct_folder . '/';

            if ($wp_filesystem->move($source, $new_source)) {
                return $new_source;
            }

            return new WP_Error(
                'devvn_reviews_rename_failed',
                __('Không thể đổi tên thư mục plugin sau khi tải bản cập nhật.', 'devvn-reviews')
            );
        }

        /**
         * After install, move plugin out of "-main" folder if site still uses old folder name.
         *
         * @param bool|WP_Error $response
         * @param array $hook_extra
         * @param array $result
         * @return bool|WP_Error
         */
        public function upgrader_post_install($response, $hook_extra, $result)
        {
            if (!$this->is_our_plugin_update($hook_extra) || is_wp_error($response)) {
                return $response;
            }

            global $wp_filesystem;

            $destination = untrailingslashit($result['destination']);
            $plugin_folder = basename($destination);
            $correct_folder = $this->normalize_plugin_folder($plugin_folder);

            if ($plugin_folder === $correct_folder) {
                return $response;
            }

            $new_destination = trailingslashit(WP_PLUGIN_DIR) . $correct_folder;

            if ($wp_filesystem->exists($new_destination) && $new_destination !== $destination) {
                $wp_filesystem->delete($destination, true);
            } elseif ($wp_filesystem->move($destination, $new_destination)) {
                $this->update_plugin_paths($plugin_folder, $correct_folder);
            } else {
                return new WP_Error(
                    'devvn_reviews_move_failed',
                    __('Không thể chuyển plugin ra khỏi thư mục có hậu tố "-main".', 'devvn-reviews')
                );
            }

            return $response;
        }

        /**
         * Update active plugin paths after folder rename.
         *
         * @param string $old_folder
         * @param string $new_folder
         */
        private function update_plugin_paths($old_folder, $new_folder)
        {
            $old_basename = $old_folder . '/' . $this->slug . '.php';
            $new_basename = $new_folder . '/' . $this->slug . '.php';

            $active_plugins = get_option('active_plugins');
            if (is_array($active_plugins)) {
                $key = array_search($old_basename, $active_plugins, true);
                if ($key !== false) {
                    $active_plugins[$key] = $new_basename;
                    update_option('active_plugins', $active_plugins);
                }
            }

            if (is_multisite()) {
                $network_plugins = get_site_option('active_sitewide_plugins');
                if (is_array($network_plugins) && isset($network_plugins[$old_basename])) {
                    $network_plugins[$new_basename] = $network_plugins[$old_basename];
                    unset($network_plugins[$old_basename]);
                    update_site_option('active_sitewide_plugins', $network_plugins);
                }
            }
        }

        /**
         * @return string|false
         */
        public function getGithub_version()
        {
            $response = wp_remote_get($this->update_path, array('timeout' => 15));
            if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
                return false;
            }

            $version = trim(wp_remote_retrieve_body($response));

            return $version !== '' ? $version : false;
        }

        public function getGithub_information()
        {
            $remote_version = $this->getGithub_version();

            return (object) array(
                'name'          => 'Echbay Woocommerce Reviews',
                'slug'          => $this->slug,
                'version'       => $remote_version ? $remote_version : $this->current_version,
                'download_link' => $this->download_link,
                'homepage'      => 'https://github.com/itvn9online/' . self::GITHUB_REPO,
                'sections'      => array(
                    'description' => 'Thay đổi giao diện phần đánh giá và thêm phần thảo luận cho chi tiết sản phẩm trong Woocommerce.',
                ),
            );
        }
    }

    /**
     * Read local plugin version from VERSION file.
     *
     * @return string
     */
    function devvn_reviews_get_local_version()
    {
        $path = dirname(dirname(__FILE__)) . '/VERSION';
        if (is_readable($path)) {
            $version = trim(file_get_contents($path));
            if ($version !== '') {
                return $version;
            }
        }

        return '0';
    }

    add_action('init', 'devvn_devvn_reviews_auto_update');
    function devvn_devvn_reviews_auto_update()
    {
        $devvn_plugin_current_version = devvn_reviews_get_local_version();
        $devvn_plugin_remote_path = sprintf(
            'https://raw.githubusercontent.com/itvn9online/%s/refs/heads/%s/VERSION',
            devvn_reviews_auto_update::GITHUB_REPO,
            devvn_reviews_auto_update::GITHUB_BRANCH
        );
        $devvn_plugin_slug = DEVVN_REVIEWS_BASENAME;
        new devvn_reviews_auto_update($devvn_plugin_current_version, $devvn_plugin_remote_path, $devvn_plugin_slug);
    }
}
