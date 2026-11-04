/* =========================================================
   ملف البرمجة الخارجي myFunctions.js (النسخة 2)
   مكتب المدار لتأجير السيارات - IWB201
   ========================================================= */

$(document).ready(function() {

    // 1. إظهار وإخفاء تفاصيل السيارات بـ jQuery
    $(".btn-toggle-details").click(function() {
        var detailsRow = $(this).closest("tr").next(".car-details-row");
        detailsRow.fadeToggle(250);

        if ($(this).text() === "التفاصيل") {
            $(this).text("إخفاء");
            $(this).css("background-color", "#ae2012");
        } else {
            $(this).text("التفاصيل");
            $(this).css("background-color", "#0a9396");
        }
    });

    // 2. زر متابعة عملية الحجز
    $("#btn-continue").click(function() {
        var selectedCars = $(".car-checkbox:checked");
        if (selectedCars.length === 0) {
            alert("تنبيه: يجب اختيار سيارة واحدة على الأقل للاستمرار!");
        } else {
            $("#booking-section").fadeIn(400);
            $('html, body').animate({
                scrollTop: $("#booking-section").offset().top - 20
            }, 500);
        }
    });

});

// 3. التحقق من صحة مدخلات النموذج
function handleFormSubmit(event) {
    event.preventDefault();
    $(".error-msg").text("");

    var isValid = true;

    var fullName = $("#fullName").val().trim();
    var nationalId = $("#nationalId").val().trim();
    var startDateVal = $("#startDate").val();
    var endDateVal = $("#endDate").val();
    var mobile = $("#mobile").val().trim();
    var email = $("#email").val().trim();

    // أ) الاسم أحرف عربية فقط
    var arabicRegex = /^[\u0600-\u06FF\s]+$/;
    if (fullName !== "" && !arabicRegex.test(fullName)) {
        $("#fullName-err").text("الاسم يتطلب أحرفاً هجائية عربية فقط!");
        isValid = false;
    }

    // ب) الرقم الوطني (11 رقم، بداية 01 إلى 14)
    var nationalIdRegex = /^(0[1-9]|1[0-4])\d{9}$/;
    if (nationalId === "") {
        $("#nationalId-err").text("يرجى إدخال الرقم الوطني!");
        isValid = false;
    } else if (!nationalIdRegex.test(nationalId)) {
        $("#nationalId-err").text("الرقم الوطني يجب أن يتألف من 11 رقم بترميز المحافظة (01-14)!");
        isValid = false;
    }

    // ج) بداية التأجير
    if (startDateVal === "") {
        $("#startDate-err").text("يرجى اختيار تاريخ بداية التأجير!");
        isValid = false;
    }

    // د) نهاية التأجير
    if (endDateVal === "") {
        $("#endDate-err").text("يرجى اختيار تاريخ نهاية التأجير!");
        isValid = false;
    }

    // هـ) فحص التعاقب الزمني
    var startDate = new Date(startDateVal);
    var endDate = new Date(endDateVal);

    if (startDateVal !== "" && endDateVal !== "") {
        if (endDate <= startDate) {
            $("#endDate-err").text("تاريخ النهاية يجب أن يكون بعد تاريخ بداية التأجير!");
            isValid = false;
        }
    }

    // و) الموبايل
    var mobileRegex = /^(09\d{8}|\+?9639\d{8})$/;
    if (mobile !== "" && !mobileRegex.test(mobile)) {
        $("#mobile-err").text("رقم الموبايل يجب أن يبدأ بـ 09 (Syriatel / MTN)!");
        isValid = false;
    }

    // ز) الإيميل
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== "" && !emailRegex.test(email)) {
        $("#email-err").text("البريد الإلكتروني غير صحيح!");
        isValid = false;
    }

    if (isValid) {
        showBookingSummary(startDate, endDate, fullName, nationalId);
    }

    return false;
}

// 4. حساب تكلفة الحجز والخصم 5%
function showBookingSummary(startDate, endDate, fullName, nationalId) {
    var diffTime = endDate.getTime() - startDate.getTime();
    var daysCount = Math.ceil(diffTime / (1000 * 3600 * 24));

    var subtotal = 0;
    var carsDetailsHtml = "<ul>";

    $(".car-checkbox:checked").each(function() {
        var code = $(this).val();
        var model = $(this).attr("data-model");
        var price = parseInt($(this).attr("data-price"), 10);

        var total = price * daysCount;
        subtotal += total;

        carsDetailsHtml += "<li><strong>" + model + " (" + code + "):</strong> " +
                           price.toLocaleString('ar-EG') + " ل.س &times; " +
                           daysCount + " أيام = <strong>" + total.toLocaleString('ar-EG') + " ل.س</strong></li>";
    });

    carsDetailsHtml += "</ul>";

    // خصم 5% عند تجاووز 10 أيام
    var discount = 0;
    if (daysCount > 10) {
        discount = subtotal * 0.05;
    }

    var finalAmount = subtotal - discount;

    var resultText = "<div class='info-box'>" +
                        "<p><strong>الاسم:</strong> " + (fullName !== "" ? fullName : "غير المذكور") + "</p>" +
                        "<p><strong>الرقم الوطني:</strong> " + nationalId + "</p>" +
                        "<p><strong>عدد أيام التأجير:</strong> " + daysCount + " يوم</p>" +
                     "</div>" +
                     "<h4>تفاصيل السيارات المحجوزة:</h4>" +
                     carsDetailsHtml +
                     "<div class='total-box'>" +
                        "<p>المجموع الأصلي: " + subtotal.toLocaleString('ar-EG') + " ل.س</p>";

    if (discount > 0) {
        resultText += "<p style='color: #ae2012;'>مبلغ الخصم (5% لإقامة > 10 أيام): - " + discount.toLocaleString('ar-EG') + " ل.س</p>";
    } else {
        resultText += "<p style='color: #666;'>لا يوجد خصم (الخصم 5% يطبق لأكثر من 10 أيام تأجير)</p>";
    }

    resultText += "<hr /><p style='font-size: 17px; color: #0a9396;'><strong>المبلغ الصافي النهائي: " + finalAmount.toLocaleString('ar-EG') + " ل.س</strong></p>" +
                  "</div>";

    $("#modal-details-content").html(resultText);
    $("#result-modal").fadeIn(300);
}

function closeResultModal() {
    $("#result-modal").fadeOut(300);
}
