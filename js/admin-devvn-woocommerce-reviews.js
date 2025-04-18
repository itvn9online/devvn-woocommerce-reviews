!(function (o) {
	o(document).ready(function () {
		var t = o("#admin_devvn_reviews_nonce").val(),
			s = !1;
		o("body").on("click", ".sync_old_reviews", function () {
			var e = o(this).closest("tr"),
				n = o(".mess", e);
			return (
				s ||
					o.ajax({
						type: "post",
						dataType: "json",
						url: devvn_reviews.ajax_url,
						data: {
							action: "devvn_reviews_sync_cmt",
							nonce: t,
						},
						context: this,
						beforeSend: function () {
							n.html("Đang chạy..."), (s = !0);
						},
						success: function (e) {
							e.success
								? n.css("color", "green").html(e.data)
								: n.css("color", "red").html(e.data),
								(s = !1);
						},
						error: function (e, t, o) {
							n.css("color", "red").html("Có lỗi xảy ra!"), (s = !1);
						},
					}),
				!1
			);
		});
		var c = !1;
		o("body").on("click", ".fake_reviews_bought", function () {
			var e = o(this).closest("tr"),
				n = o(".mess", e);
			return (
				c ||
					o.ajax({
						type: "post",
						dataType: "json",
						url: devvn_reviews.ajax_url,
						data: {
							action: "fake_reviews_bought",
							nonce: t,
						},
						context: this,
						beforeSend: function () {
							n.html("Đang chạy..."), (c = !0);
						},
						success: function (e) {
							e.success
								? n.css("color", "green").html(e.data)
								: n.css("color", "red").html(e.data),
								(c = !1);
						},
						error: function (e, t, o) {
							n.css("color", "red").html("Có lỗi xảy ra!"), (c = !1);
						},
					}),
				!1
			);
		}),
			o("body").on("change", "#review_position_select", function () {
				"custom" == o(this).val()
					? o(".review_position_action").addClass("active")
					: o(".review_position_action").removeClass("active");
			});
	});
})(jQuery);
