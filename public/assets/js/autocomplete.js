$(function () {
  $("#search").autocomplete({
    source: function (request, response) {
      $.ajax({
        url: "/blog",
        type: "GET",
        data: request,
        success: function (data) {
          response(data);
        },
      });
    },
    minLength: 2,
    focus: function (event, ui) {
      this.value = ui.item.label;
      event.preventDefault();
    },
    select: function (event, ui) {
      this.value = ui.item.label;
      $(this).next("input").val(ui.item.value);
      event.preventDefault();
      $("#quick-search").submit();
    },
  });
});
