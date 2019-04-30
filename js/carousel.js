'use strict';

var Carousel = function() {
    var config = {
        lazyload: true, // Async to load image
        showBullets: false,
        initialized: false,
        gutter: 0,
        offsetPadding: 0,
        itemWrapperClass: '.carousel__list',
        itemClass: '.carousel__item',
        itemActiveClass: '.carousel__item--active',
        navClass: '.carousel__nav',
        navItemClass: '.carousel__nav__item',
        figureClass: '.carousel__item__figure',
        responsive: {
            1024: {
                showItems: 1
            }
        },
        currentViewPort: 1024, // view port 1024 | 768 | 320
        currentActiveIndex: 0,
        totalSlides: 0,
        isLastItem: false
    };

    return {
        options: {},
        extendOptions: function(opt) {
            this.options = Object.assign({}, this.options, config);
            if (typeof opt === 'object') {
                this.options = Object.assign({}, this.options, opt);
            }
        },
        helper: {
            debounce: function(cb, wait) {
                var timeout;
                return function() {
                    var context = this, args = arguments;
                    var later = function() {
                        timeout = null;
                        cb.apply(context, args);
                    };
                    var callNow = !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        cb.apply(context, args);
                    }
                };
            }
        },
        onResize: function() {
            var _this = this;
            return this.helper.debounce(_this.setViewPort(), 500);
        },
        setViewPort: function() {
            var _this = this;
            return function() {
                var windowWidth = window.innerWidth;
                if (windowWidth >= 1024) {
                    _this.options.currentViewPort = 1024;
                } else if (windowWidth < 1024 && windowWidth > 320) {
                    _this.options.currentViewPort = 768;
                } else {
                    _this.options.currentViewPort = 320;
                }
                if (_this.options.responsive && _this.options.responsive.hasOwnProperty(_this.options.currentViewPort)) {
                    var renderItemConfig = _this.options.responsive[_this.options.currentViewPort];
                    if (_this.options.initialized) {
                        _this.updateCarousel(renderItemConfig);
                    }
                }
            }
        },
        /**
         * Init Carousel
         * @param {string} element Carousel html element class
         * @param {object} options Carousel config options
         */
        init: function(element, options) {
            var _this = this;
            this.extendOptions(options);
            (this.setViewPort())();
            
            window.addEventListener('resize', _this.onResize());

            this.options.carouselList = document.querySelectorAll(element);
            
            if (this.options.carouselList.length > 0) {
                this.options.carouselList.forEach(function(carousel) {
                    _this.options.carousel = carousel;

                    var carouselElm = carousel;
                    // Async Load image
                    if (_this.options.lazyload) {
                        var carouselFigures = carouselElm.querySelectorAll(_this.options.figureClass);
                        carouselFigures.forEach(function(figure) {
                            var figureImg = figure.querySelector('img');
                            var asyncImg = new Image();
                            asyncImg.onload = function() {
                                figureImg.src = this.src;
                            };
                            asyncImg.src = figureImg.getAttribute('data-src');
                        });
                    }
                    // Init navigation
                    if (_this.options.showBullets) {
                        _this.initNav();
                    }
                    // Init carousel
                    _this.initCarousel();
                    // Init event listener
                    _this.initEvents();
                });
            }
            _this.options.initialized = true;
        },
        initNav: function() {
            var _this = this;
            var carousel = this.options.carousel;
            var carouselItems = carousel.querySelectorAll(this.options.itemClass);
            for (var i = 0; i < carouselItems.length; i++) {
                this.generateNavBullet(carousel, i);
            }
            var bulletDots = carousel.querySelectorAll(this.options.navItemClass);
            // Active class
            if (!bulletDots[_this.options.currentActiveIndex].classList.contains('.active')) {
                bulletDots[_this.options.currentActiveIndex].classList.add('active');
            }
        },
        generateNavBullet: function(carousel, index) {
            var bulletNavWrapper = carousel.querySelector(this.options.navClass);
            var bulletElm = document.createElement('a');
            bulletElm.setAttribute('href', 'javascript:void(0);');
            bulletElm.setAttribute('role', 'button');
            bulletElm.setAttribute('data-index', index);
            bulletElm.className = this.options.navItemClass.replace('.', '');
            bulletNavWrapper.insertBefore(bulletElm, null);
        },
        initCarousel: function() {
            var _this = this;
            var carousel = this.options.carousel;
            var carouselItems = carousel.querySelectorAll(this.options.itemClass);
            var carouselItemWidth = 0;
            var carouselOutWrapperWidth = carousel.querySelector('.carousel__wrapper').offsetWidth;

            if (_this.options.responsive && _this.options.responsive.hasOwnProperty(_this.options.currentViewPort)) {
                carouselItemWidth = (carouselOutWrapperWidth / _this.options.responsive[_this.options.currentViewPort].showItems) - (_this.options.offsetPadding * 2);
            } else {
                carouselItemWidth = carouselOutWrapperWidth - (_this.options.offsetPadding * 2);
            }
            var carouselWrapper = carousel.querySelector(_this.options.itemWrapperClass);
            var carouselWrapperWidth = (carouselItemWidth * carouselItems.length) + (_this.options.gutter * (carouselItems.length - 1));
            for (let i = 0; i < carouselItems.length; i++) {
                carouselItems[i].style.width = carouselItemWidth + 'px';
                carouselItems[i].setAttribute('data-index', i);
                if (i !== carouselItems.length - 1) {
                    carouselItems[i].style.marginRight = _this.options.gutter + 'px';
                }
            }
            _this.options.totalSlides = carouselItems.length;
            // Active class
            if (!carouselItems[_this.options.currentActiveIndex].classList.contains(_this.options.itemActiveClass)) {
                carouselItems[_this.options.currentActiveIndex].classList.add(_this.options.itemActiveClass.replace('.', ''));
            }
            carouselWrapper.style.width = carouselWrapperWidth + 'px';
            carouselWrapper.style.transform = 'translate3d(0, 0, 0)';
            carousel.style.opacity = 1;
        },
        initEvents: function() {
            var _this = this;
            var carousel = this.options.carousel;
            
            document.addEventListener('click', function (event) {
                event.stopPropagation();
                event.preventDefault();
                
                var prevBtn = carousel.querySelector('.carousel__btn__prev');
                var nextBtn = carousel.querySelector('.carousel__btn__next');
                var bulletDots = carousel.querySelectorAll('.carousel__nav__item');
                // Clicked on Previous button
                if (event.target == prevBtn) {
                    _this.slideTo(-1);
                }

                // Clicked on Next button
                if (event.target == nextBtn) {
                    _this.slideTo(1);
                }
            
                // Clicked on Bullet dot
                for (var i = 0; i < bulletDots.length; i++) {
                    if (event.target == bulletDots[i]) {
                        _this.jumpTo(i);
                    }
                }
            }, false);

        },
        updateCarousel: function(config) {
            // Responsive to change the carousel items width and transform position
            var _this = this;
            console.log('update Carousel Config', config);
        },
        slideTo: function(indexOffset) {
            var _this = this;
            if (_this.options.currentActiveIndex + indexOffset <= 0) {
                // Slides to begining
                _this.options.currentActiveIndex = 0;
            } else if (_this.options.currentActiveIndex + indexOffset >= _this.options.totalSlides) {
                // Slides to end
            } else {
                _this.options.currentActiveIndex = _this.options.currentActiveIndex + indexOffset;
            }
            _this.transitionTo(_this.options.currentActiveIndex, indexOffset);
        },
        jumpTo(index) {
            // jump to slide with index
            console.log('Jump to slide: ', index);
        },
        transitionTo(index, direction) {
            var _this = this;
            var carousel = this.options.carousel;
            var carouselOutWrapperWidth = carousel.querySelector('.carousel__wrapper').offsetWidth;
            var carouselWrapper = carousel.querySelector(this.options.itemWrapperClass);
            var carouselItems = carousel.querySelectorAll(this.options.itemClass);
            var translatePosition = 0;

            if (index == 0) {
                // first
                translatePosition = 0;
            } else if (index == carouselItems.length - 1) {
                // last
                translatePosition = - ((carouselOutWrapperWidth - (_this.options.offsetPadding * 2)) * 4) + _this.options.offsetPadding;
            } else {
                var currentPosition = carouselWrapper.style.transform.replace(/\b(\w*translate3d\w*)\b|\(|\)|\s/g, '').split(',')[0].replace('px', '');
                var itemsInView = 1;
                // how many items in the view
                if (_this.options.responsive && _this.options.responsive.hasOwnProperty(_this.options.currentViewPort)) {
                    itemsInView = _this.options.responsive[_this.options.currentViewPort].showItems;
                }            
                if (direction > 0 && !_this.options.isLastItem) {
                    // next
                    translatePosition = parseInt(currentPosition) - ((carouselOutWrapperWidth / itemsInView) - (_this.options.offsetPadding * 2));
                } else if (direction < 0) {
                    // before
                    translatePosition = parseInt(currentPosition) + (((carouselOutWrapperWidth / itemsInView) - (_this.options.offsetPadding * 2)))
                }
            }
            // MOVE
            carouselWrapper.style.transform = 'translate3d(' + translatePosition + 'px, 0, 0)';
        }
    }
};