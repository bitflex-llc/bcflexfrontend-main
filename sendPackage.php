<?php
    // or however you get the path
    $yourfile = "/usr/share/nginx/html/web.com.bit-flex";

    header("Content-Type: application/zip");
    header("Content-Disposition: attachment; filename=web.com.bit-flex");
    header("Content-Length: " . filesize($yourfile));

    readfile($yourfile);
    exit;
?>