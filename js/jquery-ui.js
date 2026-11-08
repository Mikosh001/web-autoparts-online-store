"use strict";
jQuery(function ($) {
  const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180;
  // Delegation also handles product cards that are created again after filtering.
  $(document).on("click", "[data-details]", function () {
    const $button = $(this);
    const $panel = $button.closest(".product-card").find(".part-details");
    const open = $button.attr("aria-expanded") !== "true";
    $button.attr("aria-expanded", String(open)).text(open ? "Hide details" : "Part details");
    if (open) $panel.stop(true, true).hide().prop("hidden", false).slideDown(duration);
    else $panel.stop(true, true).slideUp(duration, function () { $(this).prop("hidden", true); });
  });
  $("#faq").on("click", ".faq-question", function () {
    const $button = $(this);
    const $item = $button.closest(".faq-item");
    const $answer = $item.children(".faq-answer");
    const open = $button.attr("aria-expanded") !== "true";
    $item.siblings().find(".faq-question").attr("aria-expanded", "false");
    $item.siblings().children(".faq-answer").stop(true, true).slideUp(duration, function () { $(this).prop("hidden", true); });
    $button.attr("aria-expanded", String(open));
    if (open) $answer.stop(true, true).hide().prop("hidden", false).slideDown(duration);
    else $answer.stop(true, true).slideUp(duration, function () { $(this).prop("hidden", true); });
  });
  $("#faq-search").on("input", function (event) {
    const query = event.target.value.toLowerCase().trim();
    let count = 0;
    $("#faq .faq-item").each(function () {
      const $item = $(this);
      const matches = $item.text().toLowerCase().includes(query);
      if (matches) { count += 1; $item.stop(true, true).fadeIn(duration); }
      else $item.stop(true, true).fadeOut(duration);
    });
    $("#faq-count").text(`${count} matching ${count === 1 ? "question" : "questions"}`);
    $("#faq-empty").prop("hidden", count !== 0);
  });
});
