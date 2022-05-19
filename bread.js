// ==UserScript==
// @name        Bread
// @match       <all_urls>
// @version     1.0
// @author      Toby
// @description Bread (Bionic Reading) - Read text faster & easier
// ==/UserScript==

minWordLength = 4;
minTextLength = 50;

function processNode(node) {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            return (node.nodeValue.trim() !== '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    var node;
    while (node = walker.nextNode()) {
        if (node.parentNode.nodeName == 'SCRIPT' || node.parentNode.nodeName == 'STYLE') continue;

        var text = node.nodeValue;
        if (text.length < minTextLength) continue;

        var wordStart = -1, wordLength = 0, buf = "";
        // English letters only
        for (var i = 0; i <= text.length; i++) { // We use <= here because we want to include the last character in the loop
            if (i < text.length && text[i].match(/[a-zA-Z]/)) {
                if (wordStart == -1) {
                    if (buf.length > 0) {
                        node.parentNode.insertBefore(document.createTextNode(buf), node);
                        buf = "";
                    }
                    wordStart = i;
                }
                wordLength++;
            } else {
                if (wordLength > 0) {
                    if (wordLength >= minWordLength) {
                        var word = text.substring(wordStart, wordStart + wordLength);
                        var numBold = Math.ceil(word.length * 0.3);
                        var bt = word.substring(0, numBold), nt = word.substring(numBold);

                        var span = document.createElement("span");
                        span.style.fontWeight = "bolder";
                        span.appendChild(document.createTextNode(bt));

                        node.parentNode.insertBefore(span, node);
                        node.parentNode.insertBefore(document.createTextNode(nt), node);
                    } else {
                        buf += text.substring(wordStart, wordStart + wordLength);
                    }
                }
                wordStart = -1;
                wordLength = 0;
                if (i < text.length) buf += text[i];
            }
        }
        if (buf.length > 0) {
            node.parentNode.insertBefore(document.createTextNode(buf), node);
        }

        node.nodeValue = ""; // Can't remove the node (otherwise the tree walker will break) so just set it to empty
    }
}

processNode(document.body);