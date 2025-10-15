let chatSocket;

function getCSRFToken(){
    return document.querySelector('#csrf-form [name=csrfmiddlewaretoken]').value;
}


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

    // Fetch immediately
    fetchMessages(bookingId);

    // Poll every 2 seconds
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

// Open chat on button click
$(document).on('click', '.btn-chat', function(){
    const bookingId = $(this).data('booking');
    if(bookingId){
        openChatModal(bookingId);
    } else {
        console.error('Booking ID undefined for chat button.');
    }
});

// Close chat modal
$('#close-chat').click(function(){
    $('#chat-modal').hide();
    if(chatInterval) clearInterval(chatInterval);
    currentBookingId = null;
});

// Update booking status
document.querySelectorAll('.status-btn').forEach(button => {
    button.addEventListener('click', function() {
        const bookingId = this.dataset.id;
        const status = this.dataset.status;
        const csrftoken = getCSRFToken();

        fetch(`/bookings/update-booking-status/${bookingId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({'status': status})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success){
                document.querySelector(`#booking-${bookingId} .status`).textContent = data.status;
            } else {
                alert(data.error);
            }
        })
        .catch(() => alert('Something went wrong.'));
    });
});

