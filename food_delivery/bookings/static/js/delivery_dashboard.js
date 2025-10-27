let chatSocket;
let chatInterval;
let currentBookingId = null;

function getCSRFToken() {
    return document.querySelector('#csrf-form [name=csrfmiddlewaretoken]').value;
}
function fetchMessages(bookingId) {
    $.ajax({
        url: `/bookings/ajax/get-messages/${bookingId}/`,
        method: 'GET',
        success: function (data) {
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
        error: function (err) {
            console.error('Error fetching messages', err);
        }
    });
}

function openChatModal(bookingId) {
    currentBookingId = bookingId;
    $('#chat-modal').show();
    $('#messages').html('');
    $('#chat-input').val('').focus();

    // Fetch initial messages
    fetchMessages(bookingId);

    // Refresh messages every 2 seconds
    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(function () {
        fetchMessages(bookingId);
    }, 2000);

    // Send message handler (fixed version)
    function sendMessage() {
        const message = $('#chat-input').val().trim();
        if (message !== '') {
            const csrf = getCSRFToken();
            $.ajax({
                url: `/bookings/ajax/send-message/${bookingId}/`,
                method: 'POST',
                data: {
                    message: message,
                    csrfmiddlewaretoken: csrf
                },
                success: function () {
                    fetchMessages(bookingId);
                    $('#chat-input').val('').focus();
                },
                error: function (xhr) {
                    console.error('Error sending message', xhr.responseText);
                    alert('Failed to send message. Please try again.');
                }
            });
        }
    }

    // Bind events for send button and Enter key
    $('#send-btn').off('click').on('click', sendMessage);
    $('#chat-input').off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            sendMessage();
            return false;
        }
    });
}

// Open chat when Chat button clicked
$(document).on('click', '.btn-chat', function () {
    const bookingId = $(this).data('booking');
    if (bookingId) {
        openChatModal(bookingId);
    } else {
        console.error('Booking ID undefined for chat button.');
    }
});

// Close chat modal
$('#close-chat').click(function () {
    $('#chat-modal').hide();
    if (chatInterval) clearInterval(chatInterval);
    currentBookingId = null;
    $('#messages').html('');
    $('#chat-input').val('');
});

$(document).on('click', function (e) {
    const modal = $('#chat-modal');
    if (modal.is(':visible') && !$(e.target).closest('#chat-content, .btn-chat').length) {
        modal.hide();
        if (chatInterval) clearInterval(chatInterval);
        currentBookingId = null;
        $('#messages').html('');
        $('#chat-input').val('');
    }
});

document.querySelectorAll('.status-btn').forEach(button => {
    button.addEventListener('click', function () {
        const bookingId = this.dataset.id;
        const status = this.dataset.status;
        const csrftoken = getCSRFToken();

        fetch(`/bookings/update-booking-status/${bookingId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': csrftoken
            },
            body: new URLSearchParams({ 'status': status })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const row = document.querySelector(`#booking-${bookingId}`);
                    const statusCell = row.querySelector('.status');
                    statusCell.textContent = data.status || status;
                    const currentStatus = statusCell.textContent.trim().toLowerCase();
                    if (currentStatus === 'cancelled') {
                        row.style.transition = 'opacity 0.3s ease';
                        row.style.opacity = '0';
                        setTimeout(() => row.remove(), 300);
                    }
                } else {
                    alert(data.error);
                }
            })
            .catch(() => alert('Something went wrong.'));
    });
});
