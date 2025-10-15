$(document).ready(function() {
    const images = [
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80",
        "https://assets.vogue.com/photos/63d25716ee3db4214377091e/master/w_1600%2Cc_limit/GettyImages-1265425413.jpg",
        "https://assets.vogue.com/photos/63d258c9fbbb93e998a14f44/master/w_1600,c_limit/GettyImages-980135808.jpg"
    ];

    let current = 0;
    const hero = $('.hero');

    function changeBackground() {
        hero.css('background-image', `url(${images[current]})`);
        current = (current + 1) % images.length;
    }

    // Initial background setup
    changeBackground();

    // Change every 4 seconds
    setInterval(changeBackground, 4000);
});
