<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Boost Master Switch
    |--------------------------------------------------------------------------
    */

    'enabled' => env('BOOST_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Boost Project Rules
    |--------------------------------------------------------------------------
    */

    'rules' => [
        'enabled' => env('BOOST_RULES_ENABLED', true),
        'scoped_guidelines' => env('BOOST_RULES_SCOPED_GUIDELINES', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Excluded Guidelines
    |--------------------------------------------------------------------------
    |
    | 本專案為純 API 後端，不會部署到 Laravel Cloud，排除部署相關指引。
    |
    */

    'guidelines' => [
        'exclude' => [
            'deployments',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Excluded Skills
    |--------------------------------------------------------------------------
    |
    | - infer-conventions：專案尚無既有程式碼可供推論慣例，日後有需要再移除此排除。
    | - tailwindcss-development：後端不渲染任何頁面，前端獨立於 ../frontend。
    |
    */

    'skills' => [
        'exclude' => [
            'infer-conventions',
            'tailwindcss-development',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Boost Executables Paths
    |--------------------------------------------------------------------------
    */

    'executable_paths' => [
        'php' => env('BOOST_PHP_EXECUTABLE_PATH'),
        'composer' => env('BOOST_COMPOSER_EXECUTABLE_PATH'),
        'npm' => env('BOOST_NPM_EXECUTABLE_PATH'),
        'vendor_bin' => env('BOOST_VENDOR_BIN_EXECUTABLE_PATH'),
        'current_directory' => env('BOOST_CURRENT_DIRECTORY_EXECUTABLE_PATH'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Boost Browser Logs Watcher
    |--------------------------------------------------------------------------
    |
    | 純 API 後端沒有瀏覽器頁面，關閉瀏覽器日誌監看。
    |
    */

    'browser_logs_watcher' => env('BOOST_BROWSER_LOGS_WATCHER', false),

    'browser_log_levels' => explode(',', env('BOOST_BROWSER_LOG_LEVELS', 'error,warning,info,debug')),

];
