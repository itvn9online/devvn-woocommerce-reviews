!(function (v, a) {
	v(document).ready(function () {
		function e() {
			var e = v("#countContent"),
				t = v("#comment").val();
			if (0 != (t = v.trim(t)).length) {
				t.split(/\W/);
				e.text(
					t.length + " ký tự (tối thiểu " + devvn_reviews.cmt_length + ")"
				);
			} else e.text("0 ký tự (tối thiểu " + devvn_reviews.cmt_length + ")");
		}
		if (
			(v(window).on("load", function () {
				v("body p.stars a").each(function (e) {
					switch (e) {
						case 0:
							v(this).html("Rất tệ");
							break;
						case 1:
							v(this).html("Tệ");
							break;
						case 2:
							v(this).html("Bình thường");
							break;
						case 3:
							v(this).html("Tốt");
							break;
						case 4:
							v(this).html("Rất tốt");
					}
				}),
					v("body").on("click", "#respond p.stars a", function () {
						var e = v(this),
							t = v(this).closest("#respond").find("#rating");
						v(this).closest(".stars");
						switch (e.text()) {
							case "Rất tệ":
								t.val(1);
								break;
							case "Tệ":
								t.val(2);
								break;
							case "Bình thường":
								t.val(3);
								break;
							case "Tốt":
								t.val(4);
								break;
							case "Rất tốt":
								t.val(5);
						}
					}),
					v("body p.stars a.star-5").trigger("click");
			}),
			v("#comment").keyup(function () {
				e();
			}),
			e(),
			v.validator.addMethod(
				"vietnamphone",
				function (e, t) {
					return /^0+(\d{9,10})$/.test(e);
				},
				"Hãy điền đúng số điện thoại"
			),
			v.validator.addMethod(
				"customemail",
				function (e, t) {
					return (
						"" == e ||
						/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
							e
						)
					);
				},
				"Định dạng email không đúng."
			),
			v("#commentform").validate({
				invalidHandler: function (e, t) {
					t.numberOfInvalids() ? v("div.error").show() : v("div.error").hide();
				},
				rules: {
					author: {
						required: !0,
						minlength: 2,
					},
					phone: {
						required: {
							depends: function () {
								return v(this).val(v.trim(v(this).val())), !0;
							},
						},
						vietnamphone: !0,
						minlength: 2,
					},
					email: {
						customemail: !0,
					},
					comment: {
						required: !0,
						minlength: devvn_reviews.cmt_length,
					},
				},
				messages: {
					author: "Hãy nhập họ tên",
					email: "Hãy nhập đúng email",
					phone: "Hãy nhập số điện thoại",
					comment: {
						required: "Hãy nhập nội dung tin nhắn",
						minlength: "Tối thiểu " + devvn_reviews.cmt_length + " ký tự",
					},
				},
				errorElement: "div",
				errorPlacement: function (e, t) {
					t.after(e);
				},
			}),
			v(".btn-reviews-now").on("click", function () {
				if (v("ol.commentlist .comment-respond").length <= 0)
					v.magnificPopup.open({
						items: {
							src: "#review_form_wrapper",
							type: "inline",
						},
						showCloseBtn: !1,
						closeOnBgClick: !1,
						modal: !0,
					});
				else {
					var e = v(".commentlist #respond").offset().top;
					v("html, body").animate(
						{
							scrollTop: e - 44,
						},
						500
					);
				}
			}),
			v(document).on("click", ".fancybox-close-small", function (e) {
				e.preventDefault(), v.magnificPopup.close();
			}),
			0 < v("#commentform").length)
		) {
			v("#commentform")[0].encoding = "multipart/form-data";
			var l = v(".devvn_attach_view"),
				t = v(".list_attach");

			function c() {
				v("li", l).length <= 2 && 0 < v("li", l).length
					? t.addClass("show-btn")
					: t.removeClass("show-btn");
			}
			v("body").on("change", "#files", function (e) {
				if (!e.target.files) return;
				var t = e.target.files[0],
					n = v(this);
				if (t) {
					var a = new FileReader();
					(a.onload = (function (t) {
						return function (e) {
							!(function (e, t) {
								return 0 !=
									(function (e) {
										return (
											"image/jpeg" == e ||
											"image/png" == e ||
											"image/x-png" == e ||
											"image/gif" == e
										);
									})(t.type)
									? 0 !=
											(function (e) {
												return e < devvn_reviews.img_size;
											})(t.size) ||
											(alert(
												"Tập tin (" +
													t.name +
													") quá lớn. Chỉ cho phép tải ảnh nhỏ hơn " +
													devvn_reviews.img_size_text
											),
											!1)
									: (alert(
											"Tập tin (" +
												t.name +
												") không đúng định dạng. Chỉ được tải lên file jpg/png/gif"
									  ),
									  !1);
							})(0, t) ||
								(function (e, t, n) {
									var a = n.clone().attr("name", "attach[]").removeAttr("id"),
										i = v.now(),
										r =
											'<li><div class="img-wrap"><span class="close">&times;</span><div class="img-wrap-box"><img class="thumb" src="' +
											e.target.result +
											'" title="' +
											encodeURI(t.name) +
											'" data-id="' +
											t.name +
											'"/></div></div><div class="' +
											i +
											'"></div></li>';
									l.append(r), v("." + i).append(a), c();
								})(e, t, n);
						};
					})(t)),
						a.readAsDataURL(t);
				}
			}),
				v("body").on("click", ".devvn_insert_attach", function () {
					var e = v(this).closest("#commentform");
					return (
						0 ==
						(3 <= v("li", l).length
							? (t.removeClass("show-btn"), !1)
							: (t.addClass("show-btn"), !0))
							? alert("Chỉ được phép tải lên 3 ảnh")
							: v("#files", e).trigger("click"),
						!1
					);
				}),
				v("body").on("click", ".img-wrap .close", function () {
					v(this).closest("li").remove(), c();
				});
		}
		var s = !1,
			n = v("#devvn_cmt"),
			o = v(".devvn_prod_cmt");
		n.validate({
			onclick: !1,
			onkeyup: !1,
			onfocusout: !1,
			rules: {
				devvn_cmt_name: {
					required: !0,
					minlength: 2,
				},
				devvn_cmt_email: {
					customemail: !0,
				},
				devvn_cmt_content: {
					required: !0,
					minlength: devvn_reviews.cmt_length,
				},
			},
			messages: {
				devvn_cmt_name: {
					required: "Hãy nhập họ tên",
					minlength: "Họ tên tối thiểu 2 ký tự",
				},
				devvn_cmt_email: "Hãy nhập đúng email",
				devvn_cmt_content: {
					required: "Hãy nhập nội dung tin nhắn",
					minlength:
						"Nội dùng bình luận tối thiểu " +
						devvn_reviews.cmt_length +
						" ký tự",
				},
			},
			errorPlacement: function (e, t) {
				alert(e.text());
			},
			submitHandler: function (t) {
				if (!s) {
					var e = v(t).serialize(),
						n = v("#devvn_cmt_content", t).val(),
						a = v('input[name="devvn_cmt_gender"]', t).val(),
						i = v("#devvn_cmt_name", t).val(),
						r = v("#devvn_cmt_email", t).val();
					return (
						v.ajax({
							type: "post",
							dataType: "json",
							url: devvn_reviews.ajax_url,
							data: {
								action: "devvn_cmt_submit",
								cmt_data: e,
								content: n,
								gender: a,
								name: i,
								email: r,
							},
							context: this,
							beforeSend: function () {
								(s = !0), o.addClass("devvn_loading");
							},
							success: function (e) {
								e.success
									? (e.data.result &&
											e.data.fragments &&
											v.each(e.data.fragments, function (e, t) {
												v(e).html(t);
											}),
									  alert(e.data.messages),
									  v("#devvn_cmt_content", t).val(""))
									: alert(e.data),
									(s = !1),
									o.removeClass("devvn_loading");
							},
							error: function (e, t, n) {
								alert(e.responseText), (s = !1), o.removeClass("devvn_loading");
							},
						}),
						!1
					);
				}
			},
		});
		var r = a.template("reply-devvn-cmt");
		v("body").on("click", ".devvn_cmt_reply", function () {
			v(".devvn_cmt_list_box #devvn_cmt_reply").remove();
			var e = v(this).closest("li"),
				t = v(this).attr("data-cmtid"),
				n = "@" + v(this).attr("data-authorname") + ": ";
			0 < v(".devvn_cmt_child", e).length
				? v(".devvn_cmt_child li:nth-child(1)", e).prepend(
						r({
							parent_id: t,
							authorname: n,
						})
				  )
				: e.append(
						r({
							parent_id: t,
							authorname: n,
						})
				  );
			var a = v(".devvn_cmt_list_box #devvn_cmt_reply #devvn_cmt_replycontent"),
				i = a.val();
			return (
				a.val("").focus().val(i),
				v(".devvn_cmt_list_box #devvn_cmt_reply").validate({
					onclick: !1,
					onkeyup: !1,
					onfocusout: !1,
					rules: {
						devvn_cmt_replyname: {
							required: !0,
							minlength: 2,
						},
						devvn_cmt_replyemail: {
							customemail: !0,
						},
						devvn_cmt_replycontent: {
							required: !0,
							minlength: devvn_reviews.cmt_length,
						},
					},
					messages: {
						devvn_cmt_replyname: {
							required: "Hãy nhập họ tên",
							minlength: "Họ tên tối thiểu 2 ký tự",
						},
						devvn_cmt_replyemail: "Hãy nhập đúng email",
						devvn_cmt_replycontent: {
							required: "Hãy nhập nội dung tin nhắn",
							minlength:
								"Nội dùng bình luận tối thiểu " +
								devvn_reviews.cmt_length +
								" ký tự",
						},
					},
					errorPlacement: function (e, t) {
						alert(e.text());
					},
					submitHandler: function (t) {
						if (!s) {
							var e = v(t).serialize(),
								n = v("#devvn_cmt_replycontent", t).val(),
								a = v('input[name="devvn_cmt_replygender"]', t).val(),
								i = v("#devvn_cmt_replyname", t).val(),
								r = v("#devvn_cmt_replyemail", t).val();
							return (
								v.ajax({
									type: "post",
									dataType: "json",
									url: devvn_reviews.ajax_url,
									data: {
										action: "devvn_cmt_submit",
										cmt_data: e,
										content: n,
										gender: a,
										name: i,
										email: r,
									},
									context: this,
									beforeSend: function () {
										(s = !0), o.addClass("devvn_loading");
									},
									success: function (e) {
										e.success
											? (e.data.result &&
													e.data.fragments &&
													v.each(e.data.fragments, function (e, t) {
														v(e).html(t);
													}),
											  alert(e.data.messages),
											  v("#devvn_cmt_content", t).val(""))
											: alert(e.data),
											v(".devvn_cmt_list_box #devvn_cmt_reply").remove(),
											(s = !1),
											o.removeClass("devvn_loading");
									},
									error: function (e, t, n) {
										alert(e.responseText),
											(s = !1),
											o.removeClass("devvn_loading");
									},
								}),
								!1
							);
						}
					},
				}),
				!1
			);
		}),
			v("body").on("click", ".devvn_cancel_cmt", function () {
				v(this).closest("#devvn_cmt_reply").remove();
			}),
			v("body").on("submit", "#devvn_cmt_search_form", function () {
				var e = v("#devvn_cmt_search", this).val(),
					t = v(this).serialize();
				return (
					s ||
						v.ajax({
							type: "post",
							dataType: "json",
							url: devvn_reviews.ajax_url,
							data: {
								action: "devvn_cmt_search",
								search: e,
								formData: t,
							},
							context: this,
							beforeSend: function () {
								(s = !0), o.addClass("devvn_loading");
							},
							success: function (e) {
								e.success
									? e.data.result &&
									  e.data.fragments &&
									  v.each(e.data.fragments, function (e, t) {
											v(e).html(t);
									  })
									: alert(e.data),
									(s = !1),
									o.removeClass("devvn_loading");
							},
							error: function (e, t, n) {
								alert(e.responseText), (s = !1), o.removeClass("devvn_loading");
							},
						}),
					!1
				);
			}),
			v(".cmt_attachment_img").each(function () {
				v(this).magnificPopup({
					delegate: "a",
					type: "image",
					mainClass: "mfp-img-mobile",
					gallery: {
						enabled: !0,
						navigateByImgClick: !0,
						preload: 0,
					},
				});
			});
	});
})(jQuery, wp);
