$(document).ready(function () {
    let chatInterval;
    let currentBookingId = null;

    function fetchMessages(bookingId) {
        $.ajax({
            url: `/bookings/ajax/get-messages/${bookingId}/`,
            method: 'GET',
            success: function (data) {
                $('#messages').html('');
                if (Array.isArray(data)) {
                    data.forEach(msg => {
                        const senderClass = msg.sender === 'admin' ? 'text-primary' : 'text-success';
                        $('#messages').append('<p class="' + senderClass + '"><b>' + msg.sender + ':</b> ' + msg.message + '</p>');
                    });
                    $('#messages').scrollTop($('#messages')[0].scrollHeight);
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

        fetchMessages(bookingId);

        if (chatInterval) clearInterval(chatInterval);
        chatInterval = setInterval(function () {
            fetchMessages(bookingId);
        }, 2000);

        function sendMessage() {
            const message = $('#chat-input').val().trim();
            if (message !== '') {
                $.post(`/bookings/ajax/send-message/${bookingId}/`, {
                    message: message,
                    csrfmiddlewaretoken: $('[name=csrfmiddlewaretoken]').val()
                }, function () {
                    fetchMessages(bookingId);
                });
                $('#chat-input').val('').focus();
            }
        }

        $('#send-btn').off('click').on('click', sendMessage);
        $('#chat-input').off('keypress').on('keypress', function (e) {
            if (e.which === 13) {
                sendMessage();
                return false;
            }
        });
    }

    // Open chat modal
    $(document).on('click', '.btn-chat', function () {
        const bookingId = $(this).data('booking');
        if (bookingId) openChatModal(bookingId);
    });

    // Close chat modal
    $(document).on('click', '#close-chat', function () {
        $('#chat-modal').hide();
        if (chatInterval) clearInterval(chatInterval);
        currentBookingId = null;
    });
});
