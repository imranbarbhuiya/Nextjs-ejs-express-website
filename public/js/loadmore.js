let skip = 5;
let data = [];
$(window).scroll(function () {
  if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
    $.ajax({
      url: "/blog",
      type: "GET",
      data: { skip: skip },
      success: function (blogs) {
        blogs.forEach((blog) => {
          let date = new Date(blog.createdAt).toLocaleDateString();
          let card = `<div class="card mt-4">
                <div class="card-body">
                    <h4 class="card-title">
                        ${blog.title}
                    </h4>
                    <div class="card-subtitle text-muted mb-2">
                        ${date}
                    </div>
                    <div class="card-text mb-2">
                       ${blog.description}
                    </div>
                    <a href="/blog/${blog.slug}" class="btn btn-primary">Read more</a>
                    <a href="/blog/preview/${blog._id}" class="btn btn-outline-primary">Preview</a>
                    <a class="btn btn-warning me-2" href="/blog/edit/${blog._id}">Edit</a>
                    <form action="/blog/${blog._id}?_method=DELETE" method="POST" class="d-inline">
                        <button class="btn btn-danger" type="submit">Delete</button>
                    </form>
                </div>
            </div>`;
          if (!data.includes(blog._id)) {
            $("#appendTo").append(card);
            data.push(blog._id);
          }
          skip += 5;
        });
      },
    });
  }
});
