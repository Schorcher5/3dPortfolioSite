document.addEventListener("DOMContentLoaded",function(){
  hideOnScroll = document.querySelector('.hide-on-scroll');
  if(hideOnScroll){
    var lastScrollTop = 0;

    window.addEventListener('scroll',function(){
      let scrollTop = window.scrollY;
      if(scrollTop < lastScrollTop){
        hideOnScroll.classList.remove('nav-scroll-down');
        hideOnScroll.classList.add('nav-scroll-up');
      }else if(scrollTop >= lastScrollTop){
        hideOnScroll.classList.remove('nav-scroll-up');
        hideOnScroll.classList.add('nav-scroll-down');
      }lastScrollTop = scrollTop;
    });
  }
});
