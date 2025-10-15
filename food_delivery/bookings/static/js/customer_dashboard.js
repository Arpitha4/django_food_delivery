let chatInterval;
let currentBookingId = null;

function fetchMessages(bookingId){
    $.ajax({
        url: `/bookings/ajax/get-messages/${bookingId}/`,
        method: 'GET',
        success: function(data){
            $('#messages').html('');
            if (Array.isArray(data)) {
                data.forEach(msg => {
                    $('#messages').append('<p><b>' + msg.sender + ':</b> ' + msg.message + '</p>');
                });
                $('#messages').scrollTop($('#messages')[0].scrollHeight);
            } else {
                console.warn('Received non-array data', data);
            }
        },
        error: function(err){
            console.error('Error fetching messages', err);
        }
    });
}

function openChatModal(bookingId){
    currentBookingId = bookingId;
    $('#chat-modal').show();
    $('#messages').html('');
    $('#chat-input').val('').focus();

    fetchMessages(bookingId);

    if(chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(function(){
        fetchMessages(bookingId);
    }, 2000);

    function sendMessage(){
        const message = $('#chat-input').val().trim();
        if(message !== ''){
            $.post(`/bookings/ajax/send-message/${bookingId}/`, {
                message: message,
                csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
            }, function(){
                fetchMessages(bookingId);
            });
            $('#chat-input').val('').focus();
        }
    }

    $('#send-btn').off('click').on('click', sendMessage);
    $('#chat-input').off('keypress').on('keypress', function(e){
        if(e.which === 13){
            sendMessage();
            return false;
        }
    });
}

// Open chat
$(document).on('click', '.btn-chat', function(){
    const bookingId = $(this).data('booking');
    if(bookingId) openChatModal(bookingId);
});

// Close chat
$('#close-chat').click(function(){
    $('#chat-modal').hide();
    if(chatInterval) clearInterval(chatInterval);
    currentBookingId = null;
});

// DOM ready
$(document).ready(function(){

    // Category filter
    $('.category-btn').click(function(){
        var category = $(this).data('category');
        $('.category-btn').removeClass('active');
        $(this).addClass('active');
        if(category === 'all'){
            $('.food-card').show();
        } else {
            $('.food-card').hide();
            $('.food-card[data-category="'+category+'"]').show();
        }
    });

    // Open bookings panel
    $('#open-bookings').click(function(){
        $('#bookings-panel').toggleClass('visible');
    });

    // Close bookings panel
    $('#close-panel').click(function(){
        $('#bookings-panel').removeClass('visible');
    });

    // Book selected food
    $('.top-book-btn, #open-booking-modal').click(function(e){
        e.preventDefault();
        const selected = $('#food-form input[name="food_ids"]:checked');
        if(selected.length === 0){
            alert("Select at least one food item!");
            return;
        }

        const address = prompt("Enter your delivery address:");
        if(!address || address.trim() === ""){
            alert("Address is required to book the order.");
            return;
        }

        $('#booking-address').val(address.trim());
        $('#food-form').submit();
    });

});
