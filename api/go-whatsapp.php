<?php

declare(strict_types=1);

header(
    'Cache-Control: no-store, no-cache, must-revalidate, max-age=0'
);


/*
|--------------------------------------------------------------------------
| SESSION
|--------------------------------------------------------------------------
*/

if (
    session_status()
    !== PHP_SESSION_ACTIVE
) {

    session_name(
        'domain2_plan_b'
    );

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}


/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

$baseDir =
    dirname(__DIR__, 2);


$config =
    require
        $baseDir .
        '/private/s-plan-b/visitor-secrets.php';


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

try {

    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE =>
                PDO::ERRMODE_EXCEPTION,

            PDO::ATTR_DEFAULT_FETCH_MODE =>
                PDO::FETCH_ASSOC,

            PDO::ATTR_EMULATE_PREPARES =>
                false,
        ]
    );

    $pdo->exec(
        "SET time_zone = '+08:00'"
    );


} catch (PDOException $e) {

    session_write_close();

    http_response_code(500);

    echo
        'Database connection failed.';

    exit;
}


/*
|--------------------------------------------------------------------------
| VISITOR IP
|--------------------------------------------------------------------------
*/

function getVisitorIp(): string
{
    $ip =
        $_SERVER['REMOTE_ADDR']
        ?? '';

    if (
        !empty($_SERVER['HTTP_CF_CONNECTING_IP'])
        &&
        filter_var(
            $_SERVER['HTTP_CF_CONNECTING_IP'],
            FILTER_VALIDATE_IP
        )
    ) {
        $ip =
            $_SERVER['HTTP_CF_CONNECTING_IP'];
    }

    if (
        !filter_var(
            $ip,
            FILTER_VALIDATE_IP
        )
    ) {
        return '';
    }

    return $ip;
}


$visitorIp =
    getVisitorIp();


$userAgent =
    $_SERVER['HTTP_USER_AGENT']
    ?? '';


$visitorLogId =
    isset($_SESSION['visitor_log_id'])
        ? (int)
            $_SESSION['visitor_log_id']
        : 0;


$visitorRow =
    null;


/*
|--------------------------------------------------------------------------
| SESSION ROW
|--------------------------------------------------------------------------
*/

if ($visitorLogId > 0) {

    $stmt =
        $pdo->prepare(
            "
            SELECT
                id,
                visitor_ip,
                user_agent

            FROM visitor_logs

            WHERE id = :id

            LIMIT 1
            "
        );


    $stmt->execute([
        ':id' =>
            $visitorLogId,
    ]);


    $candidate =
        $stmt->fetch()
        ?: null;


    if ($candidate) {

        if (
            (string)$candidate['visitor_ip']
                === $visitorIp
            &&
            (string)$candidate['user_agent']
                === $userAgent
        ) {
            $visitorRow =
                $candidate;
        }
    }
}


/*
|--------------------------------------------------------------------------
| FALLBACK — SAME IP + UA
|--------------------------------------------------------------------------
*/

if (
    !$visitorRow
    &&
    $visitorIp !== ''
    &&
    $userAgent !== ''
) {

    $stmt =
        $pdo->prepare(
            "
            SELECT id

            FROM visitor_logs

            WHERE visitor_ip =
                :visitor_ip

              AND user_agent =
                :user_agent

              AND whatsapp_clicked_at
                IS NULL

              AND created_at >=
                  CURRENT_TIMESTAMP
                  - INTERVAL 30 MINUTE

            ORDER BY id DESC

            LIMIT 1
            "
        );


    $stmt->execute([
        ':visitor_ip' =>
            $visitorIp,

        ':user_agent' =>
            $userAgent,
    ]);


    $visitorRow =
        $stmt->fetch()
        ?: null;


    if ($visitorRow) {

        $_SESSION['visitor_log_id'] =
            (int)
            $visitorRow['id'];
    }
}


/*
|--------------------------------------------------------------------------
| UPDATE EXISTING ROW
|--------------------------------------------------------------------------
|
| NO INSERT
|
*/

if ($visitorRow) {

    $stmt =
        $pdo->prepare(
            "
            UPDATE visitor_logs

            SET whatsapp_clicked_at =
                COALESCE(
                    whatsapp_clicked_at,
                    CURRENT_TIMESTAMP
                )

            WHERE id = :id
            "
        );


    $stmt->execute([
        ':id' =>
            (int)
            $visitorRow['id'],
    ]);
}


/*
|--------------------------------------------------------------------------
| ONE WHATSAPP DESTINATION
|--------------------------------------------------------------------------
*/

$number =
    preg_replace(
        '/\D+/',
        '',
        (string)(
            $config['whatsapp_number']
            ?? ''
        )
    );


$message =
    trim(
        (string)(
            $config['whatsapp_message']
            ?? ''
        )
    );


if (
    !is_string($number)
    ||
    $number === ''
) {
    $number = '60123456789';
}


$whatsappUrl =
    'https://wa.me/' .
    $number;


if ($message !== '') {

    $whatsappUrl .=
        '?text=' .
        rawurlencode($message);
}


session_write_close();


header(
    'Location: ' .
    $whatsappUrl,
    true,
    302
);


exit;