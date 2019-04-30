'use strict';
window.onload = function() {
    

    var editorialCarousel = new Carousel();
    console.log('editorialCarousel: ', editorialCarousel);
    editorialCarousel.init('#carousel__slider', {
        lazyload: true,
        showBullets: true,
        gutter: 0,
        offsetPadding: 0
    });
    
    
    var profileCarousel = new Carousel();
    profileCarousel.init('#carousel__profile-slider', {
        lazyload: true,
        showBullets: false,
        responsive: {
            1024: {
                showItems: 4
            },
            768: {
                showItems: 3
            },
            320: {
                showItems: 1
            }
        }
    });
};