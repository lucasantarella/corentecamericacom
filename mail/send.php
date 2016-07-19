<?php
// Create Session
use SendGrid\Email;

$requestBody = json_decode(file_get_contents("php://input"), true);
print_r($requestBody);
if ($requestBody != false) {


// Sanitize inputs with Phalcon
    $filter = new \Phalcon\Filter();
    $requestBody['name'] = $filter->sanitize($requestBody['name'], 'string');
    $requestBody['email'] = $filter->sanitize($requestBody['email'], 'email');
    $requestBody['message'] = $filter->sanitize($requestBody['message'], 'email');

    print_r($requestBody);
    if (
        isset($requestBody['email']) &&
        isset($requestBody['name']) &&
        isset($requestBody['message'])
    ) {

// Finally send the mail
        require __DIR__ . '/../vendor/autoload.php';
        $sendgrid = new SendGrid("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");
        $email = new Email();

        //sumbission data
        $ipaddress = $_SERVER['REMOTE_ADDR'];
        $date = date('d/m/Y');
        $time = date('H:i:s');

        $emailbody = "<p>You have recieved a new message from the enquiries form on your website.</p>
					  <p><strong>Name: </strong> {$requestBody['name']} </p>
					  <p><strong>Email Address: </strong> {$requestBody['email']} </p>
					  <p><strong>Message: </strong><pre>{$requestBody['message']}</pre></p><br/>
					  <p>This message was sent from the IP Address: {$ipaddress} on {$date} at {$time}</p>";


        $email->addTo("luca.santarella@gmail.com")
            ->setFrom("enquires@corentecamerica.com")
            ->setSubject("New Enquiry From: {$requestBody['name']} <{$requestBody['email']}>")
            ->setHtml($emailbody);

        $sendgrid->send($email);
    } else {
        ignore_user_abort(true);
        header("HTTP/1.1 400 Bad Request");
        header("Connection: close", true);
        exit;
    }
} else {
    ignore_user_abort(true);
    header("HTTP/1.1 400 Bad Request");
    header("Connection: close", true);
    exit;
}