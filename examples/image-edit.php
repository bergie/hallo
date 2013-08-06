<?php
/**
 *
 * Mock file to test the image-browser plugin for Hallo.
 * Does support:
 *
 * $query = string which searches inside the alt text
 * $limit = The max number of results
 * $page = the current page
 *
 * File works fine with PHP 5.3.
 *
 * Please note: the code below is crap. It's really just a mock.
 *
 * (c) 2013 Christian Grobmeier, http://www.grobmeier.de
 * This plugin may be freely distributed under the MIT license
 *
 */
$limit = 4;
if (isset($_GET['limit'])) {
    $limit = $_GET['limit'];
}

$page = 1;
if (isset($_GET['page'])) {
    $page = $_GET['page'];
}

$query = null;
if (isset($_GET['query'])) {
    $query = $_GET['query'];
}

$items = array();

function createItem($url, $alt) {
    global $items;
    $item = new stdClass();
    $item->url = $url;
    $item->alt = $alt;
    array_push($items, $item);
}

function searchAlt($query) {
    global $items;

    if ($query == null || $query == '') {
        return $items;
    }

    $result = array();
    foreach ($items as $item) {
        if (stripos($item->alt, $query) !== false) {
            array_push($result, $item);
        }
    }
    return $result;
}

createItem('http://farm4.staticflickr.com/3139/2780642603_8d2c90e364.jpg', 'Apple in red');
createItem('http://farm5.staticflickr.com/4152/5030705620_34a1a832e7.jpg', 'Drawn apple');
createItem('http://farm1.staticflickr.com/249/448820990_099a4aa69f.jpg', 'Lot of apples');
createItem('http://farm1.staticflickr.com/42/117674694_6dd1d296d7.jpg', 'Apples and friends');
createItem('http://farm8.staticflickr.com/7431/9362927543_d40f79b36a.jpg', 'Some text');
createItem('http://farm4.staticflickr.com/3761/9356238831_cb58a8baf5_d.jpg', 'Different text');
createItem('http://farm3.staticflickr.com/2889/9352357240_c79d394400_d.jpg', 'Maybe this is a bit a longer text');
createItem('http://farm4.staticflickr.com/3696/9345335094_be365fdab6_d.jpg', 'next text with apple');
createItem('http://farm4.staticflickr.com/3734/9322150468_fe5fe2f7a4.jpg', 'Huhu, whats that?');
createItem('http://farm8.staticflickr.com/7357/9298373119_9902747b9d.jpg', 'Another great image but not an apple');
createItem('http://farm4.staticflickr.com/3694/9301120418_54da974801.jpg', 'Shot!');
createItem('http://farm4.staticflickr.com/3681/9282238633_a31893072c.jpg', 'Alt text is boring');
createItem('http://farm4.staticflickr.com/3676/9282215263_7ce9159c64_d.jpg', 'because it means');
createItem('http://farm3.staticflickr.com/2857/9253163149_0431b6a9d5.jpg', 'you write some stuff');
createItem('http://farm8.staticflickr.com/7362/9255932446_8355615883.jpg', 'even without looking');
createItem('http://farm8.staticflickr.com/7415/9255732202_76bcffd627.jpg', 'at the actual image. akward.');

$selection = searchAlt($query);
$start = ($page * $limit) - $limit;
$result = new stdClass();
$result->page = $page;
$result->total = sizeOf($selection);

$result->results = array_splice($selection, $start, $limit);
echo ')]}\','.PHP_EOL.json_encode($result);