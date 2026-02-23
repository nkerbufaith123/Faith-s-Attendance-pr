<?php
echo "PHP CWD: " . getcwd() . PHP_EOL;
foreach (scandir(getcwd()) as $f) {
    echo $f . PHP_EOL;
}
?>
