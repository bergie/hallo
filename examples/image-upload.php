<?php
$uploaddir = realpath('testimageuploads');

$uploadfile = $uploaddir.'/'.basename($_FILES['file']['name']);

if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadfile)) {
    header("HTTP/1.0 403 Forbidden");
    echo "No chance";
} else {
    $result = new stdClass;
    $result->url = 'testimageuploads/' . basename($_FILES['file']['name']);

    echo json_encode($result);
}



