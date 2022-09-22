function openModal(id) {
  var modal = document.getElementById(id);
  var modalContent = modal.getElementsByClassName("modal-content");
  var closeButton = modal.getElementsByClassName("close");
  modal.classList.add("active");
  modal.style.animation = "fadeIn 500ms";
  document.body.style.overflow = "hidden";

  closeButton[0].addEventListener(
    "click",
    (e) => {
      modalContent[0].style.animation = "slideUp 500ms";
      modal.style.animation = "fadeOut 500ms";
      setTimeout(function () {
        modal.classList.remove("active");
        modal.style.animation = "none";
        modalContent[0].style.animation = "slideDown 500ms";
      }, 500);
      document.body.style.overflow = "scroll";
    },
    { once: true }
  );
}

function closeModal(id) {
  var modal = document.getElementById(id);
  var modalContent = modal.getElementsByClassName("modal-content");
  modalContent[0].style.animation = "slideUp 500ms";
  modal.style.animation = "fadeOut 500ms";
  setTimeout(function () {
    modal.classList.remove("active");
    modal.style.animation = "none";
    modalContent[0].style.animation = "slideDown 500ms";
  }, 500);
  document.body.style.overflow = "scroll";
}
