// ==UserScript==
// @name        百度+其他(双侧)
// @namespace   Tampermonkey Scripts
// @version     0.1
// @author      Will_the_Wizard
// @description 聚合百度和搜狗和必应结果
// @homepageURL 
// @updateURL   
// @icon        
// @match       http*://www.baidu.com/*
// @grant       none
// @run-at      document-start
// @noframes
// ==/UserScript==

(function() {
    
    function loadSheet() {
        var sheet = `
            /* baidu right */
            #content_right {
                display: none !important;
            }

            /* div to contain the sogou */
            .search-engine-div {
                position: absolute;
                overflow: hidden;
                border: 0px;
                border-left: 1px solid #F5F5F5;
            }
            /* iframe */
            .search-engine-iframe {
                border: 0px;
            }
        `;
        var css = document.createElement('style');
        css.type = 'text/css';
        css.id = 'multi-search-css';
        css.textContent = sheet;
        document.getElementsByTagName('head')[0].appendChild(css);
    }

    //
    // multiple search results
    //
    function multiSearch() {

        function isUrlMatched(urlRegex) {
            var windowUrl = window.location.href;
            return urlRegex.test(windowUrl);
        }

        function getQuery(inputPath) {
            var query = document.evaluate(inputPath, document, null, 9, null).singleNodeValue.value.trim();
            return encodeURIComponent(query);
        }

        function removeElements(ids) {
            for (var i=0; i<ids.length; i++) {
                var e = document.getElementById(ids[i]);
                if (e) {
                    e.parentNode.removeChild(e);
                }
            }
        }

        function doOneSearch(id, url, query,
            displayDivTop,      // 显示区域div距离文档顶部距离
            displayDivLeft,     // 显示区域div距离文档左侧距离
            displayDivWidth,    // 显示区域div宽度
            displayDivHeight,   // 显示区域div高度
            iframeMarginTop,    // iframe相对于显示区域需要调整的高度
            iframeMarginLeft    // iframe相对于显示区域需要调整的宽度
        ) {
            // 创建显示区域div
            var div = document.createElement('div');
            div.id = id + '-div';
            div.className = 'search-engine-div';
            div.style.top = displayDivTop + 'px';
            div.style.left = displayDivLeft + 'px';
            div.style.width = displayDivWidth + 'px';
            div.style.height = displayDivHeight + 'px';
            document.body.appendChild(div);

            // 创建搜索引擎iframe
            var iframe = document.createElement('iframe');
            iframe.id = id + '-iframe';
            iframe.className = 'search-engine-iframe';
            iframe.style.marginTop = iframeMarginTop + 'px';
            iframe.style.marginLeft = iframeMarginLeft + 'px';
            iframe.style.width = (displayDivWidth - iframeMarginLeft) + 'px';
            iframe.style.height = (displayDivHeight - iframeMarginTop)/3*2 + 'px';
            iframe.scrolling = 'no';
            iframe.src = url[0].replace('%s', query);
            div.appendChild(iframe);
            var iframe1 = document.createElement('iframe');
            iframe1.id = id + '-iframe1';
            iframe1.className = 'search-engine-iframe';
            iframe1.style.marginTop = iframeMarginTop + 'px';
            iframe1.style.marginLeft = iframeMarginLeft-80 + 'px';
            iframe1.style.width = (displayDivWidth - iframeMarginLeft)+200 + 'px';
            iframe1.style.height = (displayDivHeight - iframeMarginTop)/3 + 'px';
            iframe1.style.zoom='0.9';
            iframe1.scrolling = 'no';
            iframe1.src = url[1].replace('%s', query);
            div.appendChild(iframe1);
        }


        // 百度 + 搜狗 + bing
        //
        function baiduPageMultiSearch() {
            if (!document.getElementById('content_right')) {
                return;
            }
            removeElements(['content_right']);
            if (!document.getElementById('search-engine-css')) {
                loadSheet();
            }
            var docWidth = document.body.scrollWidth;
            var docHeight = document.body.scrollHeight;
            var query = getQuery('//input[@id="kw"]');
            
            // sogou + bing
            doOneSearch('other', ['https://www.sogou.com/web?query=%s','https://cn.bing.com/search?q=%s',], query, 112, docWidth - 711, 620, docHeight - 220, -138, -110);
        }
        if (isUrlMatched(/^https?:\/\/www\.baidu\.com\//)) {
            baiduPageMultiSearch();
            window.setInterval(baiduPageMultiSearch, 300);
        }
    }

    // 避免在iframe中嵌套调用
    if (window.self != window.top) return;

    loadSheet();
    if (document.readyState == 'interactive' || document.readyState == 'complete' || document.readyState == 'loaded') {
        multiSearch();
    } else {
        window.addEventListener('DOMContentLoaded', multiSearch, true);
    }

})();
