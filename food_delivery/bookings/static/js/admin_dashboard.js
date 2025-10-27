$(document).ready(function () {
    let chatInterval;
    let currentBookingId = null;

    // Fetch chat messages
    function fetchMessages(bookingId) {
        $.ajax({
            url: `/bookings/ajax/get-messages/${bookingId}/`,
            method: 'GET',
            success: function (data) {
                console.log(data);
                $('#messages').html('');

                if (Array.isArray(data)) {
                    data.forEach(msg => {
                        const messageText = msg.text || msg.message || msg.content || '';
                        const senderClass = msg.sender === 'admin' ? 'text-primary' : 'text-success';
                        $('#messages').append(
                            '<p class="' + senderClass + '"><b>' + msg.sender + ':</b> ' + messageText + '</p>'
                        );
                    });
                    $('#messages').scrollTop($('#messages')[0].scrollHeight);
                }
            },
            error: function (err) {
                console.error('Error fetching messages', err);
            }
        });
    }

    // Open chat modal popup
    function openChatModal(bookingId) {
        currentBookingId = bookingId;
        $('#chat-modal').fadeIn(200).css('display', 'flex');  // Popup centered
        $('#messages').html('');
        $('#chat-input').val('').focus();

        fetchMessages(bookingId);

        if (chatInterval) clearInterval(chatInterval);
        chatInterval = setInterval(function () {
            fetchMessages(bookingId);
        }, 2000);

        // Send message function
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

        // Button click send
        $('#send-btn').off('click').on('click', sendMessage);

        // Enter key send
        $('#chat-input').off('keypress').on('keypress', function (e) {
            if (e.which === 13) {
                sendMessage();
                return false;
            }
        });
    }

    // Click chat button → open popup
    $(document).on('click', '.btn-chat', function () {
        const bookingId = $(this).data('booking');
        if (bookingId) openChatModal(bookingId);
    });

    // Close chat modal
    $(document).on('click', '#close-chat', function () {
        $('#chat-modal').fadeOut(200);
        if (chatInterval) clearInterval(chatInterval);
        currentBookingId = null;
    });
});
