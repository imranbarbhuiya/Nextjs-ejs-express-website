const closeButton = document.querySelectorAll(".flash-close");

closeButton.forEach((close) => {
  close.addEventListener("click", () => {
    close.parentElement.remove();
  });
});
