$(document).ready(function() {
  $('#otpForm').on('submit', function(e) {
    const otp = $('#otp').val().trim();
    const otpRegex = /^[0-9]{4,6}$/; // assuming OTP is 4-6 digits
    if (!otpRegex.test(otp)) {
      alert("Please enter a valid OTP (4-6 digits).");
      e.preventDefault(); // prevent form submission
    }
  });
});
