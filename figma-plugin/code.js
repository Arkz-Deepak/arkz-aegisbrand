// AegisBrand AI - Figma Desktop Plugin Controller
// Runs inside the Figma desktop/web sandbox

figma.showUI(__html__, { width: 380, height: 600, themeColors: true });

function getSelectedTextNodes(nodes) {
  const textNodes = [];
  function traverse(n) {
    if (n.type === 'TEXT') {
      textNodes.push(n);
    } else if ('children' in n) {
      for (const child of n.children) {
        traverse(child);
      }
    }
  }
  for (const node of nodes) {
    traverse(node);
  }
  return textNodes;
}

function sendSelectionState() {
  const selection = figma.currentPage.selection;
  if (!selection || selection.length === 0) {
    figma.ui.postMessage({
      type: 'SELECTION_EMPTY',
      message: 'Select a text layer or frame to inspect brand compliance.',
    });
    return;
  }

  const textNodes = getSelectedTextNodes(selection);
  if (textNodes.length === 0) {
    figma.ui.postMessage({
      type: 'NO_TEXT_FOUND',
      message: 'Selected element contains no text layers. Select a text frame.',
    });
    return;
  }

  const combinedText = textNodes.map((n) => n.characters).join('\n\n');
  const primaryNodeName = selection[0].name;

  figma.ui.postMessage({
    type: 'SELECTION_LOADED',
    nodeName: primaryNodeName,
    textCount: textNodes.length,
    characters: combinedText,
  });
}

// Listen to canvas selection changes in Figma
figma.on('selectionchange', () => {
  sendSelectionState();
});

// Handle incoming messages from the plugin UI webview
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'GET_SELECTION') {
    sendSelectionState();
  }

  if (msg.type === 'APPLY_REWRITE') {
    const { originalText, replacementText } = msg;
    const selection = figma.currentPage.selection;
    const textNodes = getSelectedTextNodes(selection);

    let replacedCount = 0;
    for (const node of textNodes) {
      if (node.characters.includes(originalText)) {
        try {
          // Load existing font so Figma allows modifying characters
          if (node.fontName !== figma.mixed) {
            await figma.loadFontAsync(node.fontName);
          } else {
            // Mixed fonts: load font for first character
            const firstFont = node.getRangeFontName(0, 1);
            await figma.loadFontAsync(firstFont);
          }
          node.characters = node.characters.replace(originalText, replacementText);
          replacedCount++;
        } catch (err) {
          console.error('Failed to load font or replace characters:', err);
        }
      }
    }

    if (replacedCount > 0) {
      figma.notify(`✨ AegisBrand: Applied brand rewrite to ${replacedCount} canvas layer(s)!`);
      sendSelectionState();
    } else {
      figma.notify('⚠️ Could not find exact text match in current selection.');
    }
  }

  if (msg.type === 'APPLY_ALL_REWRITES') {
    const { replacements } = msg;
    const selection = figma.currentPage.selection;
    const textNodes = getSelectedTextNodes(selection);

    let totalFixed = 0;
    for (const rep of replacements) {
      for (const node of textNodes) {
        if (node.characters.toLowerCase().includes(rep.original.toLowerCase())) {
          try {
            if (node.fontName !== figma.mixed) {
              await figma.loadFontAsync(node.fontName);
            }
            const regex = new RegExp(rep.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            node.characters = node.characters.replace(regex, rep.replacement);
            totalFixed++;
          } catch (err) {
            console.error('Font load error:', err);
          }
        }
      }
    }

    figma.notify(`🎉 AegisBrand: Successfully resolved ${totalFixed} brand violation(s) on canvas!`);
    sendSelectionState();
  }

  if (msg.type === 'CLOSE_PLUGIN') {
    figma.closePlugin();
  }
};

// Send initial state on launch
sendSelectionState();
