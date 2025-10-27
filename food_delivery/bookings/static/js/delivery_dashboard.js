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
                    // Handle possible backend key names
                    const messageText = msg.text || msg.message || msg.content || '';
                    $('#messages').append('<p><b>' + msg.sender + ':</b> ' + messageText + '</p>');
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
    $('#chat-modal').fadeIn(200).addClass('show');
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

    $('#send-btn').off('click').on('click', sendMessage);
    $('#chat-input').off('keypress').on('keypress', function (e) {
        if (e.which === 13) {
            sendMessage();
            return false;
        }
    });
}

// Open chat button
$(document).on('click', '.btn-chat', function () {
    const bookingId = $(this).data('booking');
    if (bookingId) openChatModal(bookingId);
});

// Close chat
$('#close-chat').click(function () {
    $('#chat-modal').fadeOut(200).removeClass('show');
    if (chatInterval) clearInterval(chatInterval);
    currentBookingId = null;
    $('#messages').html('');
    $('#chat-input').val('');
});

// Click outside to close
$(document).on('click', function (e) {
    const modal = $('#chat-modal');
    if (modal.is(':visible') && !$(e.target).closest('#chat-content, .btn-chat').length) {
        modal.fadeOut(200).removeClass('show');
        if (chatInterval) clearInterval(chatInterval);
        currentBookingId = null;
        $('#messages').html('');
        $('#chat-input').val('');
    }
});

// Helper: disable a table row (visual + functional)
function disableRow(row) {
    if (!row) return;
    row.classList.add('disabled-row');
    const interactives = row.querySelectorAll('button, input, select, a');
    interactives.forEach(el => {
        try { el.disabled = true; } catch (e) {}
        el.classList.add('disabled-control');
        if (el.tagName.toLowerCase() === 'a') el.style.pointerEvents = 'none';
    });
}

// Helper: enable a table row
function enableRow(row) {
    if (!row) return;
    row.classList.remove('disabled-row');

    const interactives = row.querySelectorAll('button, input, select, a');
    interactives.forEach(el => {
        try { el.disabled = false; } catch (e) {}
        el.classList.remove('disabled-control');
        if (el.tagName.toLowerCase() === 'a') el.style.pointerEvents = '';
    });
}

// On page load: disable rows already cancelled
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('tr[id^="booking-"]').forEach(row => {
        const statusCell = row.querySelector('.status');
        if (statusCell && statusCell.textContent.trim().toLowerCase() === 'cancelled') {
            disableRow(row);
        }
    });
});

// Booking status update logic (replacement)
document.querySelectorAll('.status-btn').forEach(button => {
    button.addEventListener('click', function (e) {
        if (this.disabled) {
            e.preventDefault();
            return;
        }
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
                        row.style.opacity = '0.5';
                        disableRow(row);
                    } else {
                        enableRow(row);
                        row.style.opacity = '1';
                    }
                } else {
                    alert(data.error || 'Failed to update status.');
                }
            })
            .catch((err) => {
                console.error('Status update error', err);
                alert('Something went wrong while updating the status.');
            });
    });
});

