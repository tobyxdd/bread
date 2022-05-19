// ==UserScript==
// @name        Bread
// @match       <all_urls>
// @version     1.0
// @author      Toby
// @description Bread (Bionic Reading) - Read text faster & easier
// ==/UserScript==

minWordLength = 4;
minTextLength = 50;

function insertTextBefore(text, node, bold) {
    if (bold) {
        var span = document.createElement("span");
        span.style.fontWeight = "bolder";
        span.appendChild(document.createTextNode(text));

        node.parentNode.insertBefore(span, node);
    }
    else {
        node.parentNode.insertBefore(document.createTextNode(text), node);
    }
}

function processNode(node) {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            return (node.nodeValue.trim().length >= minTextLength &&
                node.parentNode.nodeName !== 'SCRIPT' &&
                node.parentNode.nodeName !== 'NOSCRIPT' &&
                node.parentNode.nodeName !== 'STYLE') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });

    var node;
    while (node = walker.nextNode()) {
        var text = node.nodeValue;
        var wStart = -1, wLen = 0, eng = false;

        // English letters only
        for (var i = 0; i <= text.length; i++) { // We use <= here because we want to include the last character in the loop
            var cEng = i < text.length ? /[a-zA-Z]/.test(text[i]) : false;

            if (i == text.length || eng !== cEng) {
                // State flipped or end of string
                if (eng && wLen >= minWordLength) {
                    var word = text.substring(wStart, wStart + wLen);
                    var numBold = Math.ceil(word.length * 0.3);
                    var bt = word.substring(0, numBold), nt = word.substring(numBold);
                    insertTextBefore(bt, node, true);
                    insertTextBefore(nt, node, false);
                } else if (wLen > 0) {
                    var word = text.substring(wStart, wStart + wLen);
                    insertTextBefore(word, node, false);
                }
                wStart = i;
                wLen = 1;
                eng = cEng;
            } else {
                wLen++;
            }
        }

        node.nodeValue = ""; // Can't remove the node (otherwise the tree walker will break) so just set it to empty
    }
}

processNode(document.body);