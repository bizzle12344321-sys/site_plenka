<?php
// Обработчик заявок: пересылает заявку в рабочий чат Telegram через бота.
// 1. Создайте бота у @BotFather и вставьте его токен ниже.
// 2. Добавьте бота в рабочий чат и вставьте ID чата (для групп начинается с "-").
//    ID можно узнать, открыв https://api.telegram.org/bot<ТОКЕН>/getUpdates после сообщения в чате.

$BOT_TOKEN = 'ВСТАВЬТЕ_ТОКЕН_БОТА';
$CHAT_ID   = 'ВСТАВЬТЕ_ID_ЧАТА';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

// Скрытое поле-ловушка для ботов
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$clean = function ($key, $max) {
    $v = trim((string)($_POST[$key] ?? ''));
    return htmlspecialchars(mb_substr($v, 0, $max), ENT_QUOTES, 'UTF-8');
};

$name    = $clean('name', 100);
$phone   = $clean('phone', 30);
$message = $clean('message', 1000);

if ($name === '' || strlen(preg_replace('/\D/', '', $phone)) !== 11) {
    http_response_code(400);
    echo json_encode(['ok' => false]);
    exit;
}

$text = "<b>Новая заявка с сайта</b>\n\n"
      . "<b>Имя:</b> {$name}\n"
      . "<b>Телефон:</b> {$phone}\n"
      . "<b>Что нужно:</b> " . ($message !== '' ? $message : '—');

$ch = curl_init("https://api.telegram.org/bot{$BOT_TOKEN}/sendMessage");
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => ['chat_id' => $CHAT_ID, 'text' => $text, 'parse_mode' => 'HTML'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode((string)$response, true);
echo json_encode(['ok' => !empty($result['ok'])]);
