const slide = (container, innerContainer) => {
  // define default mutable properties
  let positionToLeft = 0,
    positionToRight = 0,
    initialPosition,
    finalPosition,
    scrollEndThreshold = 100,
    activeIndex = 0,
    allowShift = true,
    slidesCount = 0,
    slideWidth = 0;

  const registerEventListeners = () => {
    const slides = innerContainer.getElementsByClassName("slide");
    slidesCount = slides.length;
    const firstSlide = slides[0],
      lastSlide = slides[slidesCount - 1],
      cloneFirst = firstSlide.cloneNode(true),
      cloneLast = lastSlide.cloneNode(true);

    slideWidth = innerContainer.getElementsByClassName("slide")[0].offsetWidth;

    // Clone first and last slide to allow infinite scroll
    innerContainer.appendChild(cloneFirst);
    innerContainer.insertBefore(cloneLast, firstSlide);
    container.classList.add("ready");

    // Mouse events
    innerContainer.onmousedown = dragStart;

    // Touch events
    innerContainer.addEventListener("touchstart", dragStart);
    innerContainer.addEventListener("touchend", dragEnd);
    innerContainer.addEventListener("touchmove", dragAction);

    // Transition events
    innerContainer.addEventListener("transitionend", onTransition);
  };

  const dragStart = (event) => {
    event = event || window.event;
    event.preventDefault();
    initialPosition = innerContainer.offsetLeft;

    if (event.type === "touchstart") {
      positionToLeft = event.touches[0].clientX;
    } else {
      positionToLeft = event.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  };

  const dragAction = (event) => {
    event = event || window.event;

    if (event.type === "touchmove") {
      positionToRight = positionToLeft - event.touches[0].clientX;
      positionToLeft = event.touches[0].clientX;
    } else {
      positionToRight = positionToLeft - event.clientX;
      positionToLeft = event.clientX;
    }
    innerContainer.style.left =
      innerContainer.offsetLeft - positionToRight + "px";
  };

  const dragEnd = (_) => {
    finalPosition = innerContainer.offsetLeft;
    if (finalPosition - initialPosition < -scrollEndThreshold) {
      shiftSlide(1, "drag");
    } else if (finalPosition - initialPosition > scrollEndThreshold) {
      shiftSlide(-1, "drag");
    } else {
      innerContainer.style.left = initialPosition + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  };

  const shiftSlide = (dir, action) => {
    innerContainer.classList.add("shifting");

    if (allowShift) {
      if (!action) {
        initialPosition = innerContainer.offsetLeft;
      }

      if (dir === 1) {
        innerContainer.style.left = initialPosition - slideWidth + "px";
        activeIndex++;
      } else if (dir === -1) {
        innerContainer.style.left = initialPosition + slideWidth + "px";
        activeIndex--;
      }
    }

    allowShift = false;
  };

  const onTransition = () => {
    innerContainer.classList.remove("shifting");

    if (activeIndex === -1) {
      innerContainer.style.left = -(slidesCount * slideWidth) + "px";
      activeIndex = slidesCount - 1;
    }

    if (activeIndex === slidesCount) {
      innerContainer.style.left = -slideWidth + "px";
      activeIndex = 0;
    }
    allowShift = true;
  };

  registerEventListeners();
};

const slider = document.getElementById("outer_container"),
  sliderItems = document.getElementById("slides");

slide(slider, sliderItems);
