import https from 'https';
import fs from 'fs';
import path from 'path';

const NOTION_TOKEN = process.env.NOTION_TOKEN || '';
const TARGET_PAGE_ID = '3d46ad00-c97d-80fd-b378-d1ad32c8731c';
const SOURCE_PAGE_ID = '31f12a10-3067-8038-9720-fe577aca7758';

function callPublicNotion(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const p = JSON.stringify(payload);
    const req = https.request({
      hostname: 'www.notion.so',
      path: '/api/v3/' + endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(p)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(p);
    req.end();
  });
}

function callPrivateNotion(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const p = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.notion.com',
      path: '/v1/' + endpoint,
      method: method,
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...(p ? { 'Content-Length': Buffer.byteLength(p) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (err) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (p) req.write(p);
    req.end();
  });
}

// Check target page connection
async function checkTargetAccess() {
  const res = await callPrivateNotion('GET', `pages/${TARGET_PAGE_ID}`);
  return res;
}

// Fetch all blocks of a page recursively from public Notion
async function fetchPageTree(pageId) {
  const chunk = await callPublicNotion('loadPageChunk', {
    pageId: pageId,
    limit: 500,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false
  });

  const blockMap = {};
  for (const [id, b] of Object.entries(chunk.recordMap?.block || {})) {
    blockMap[id] = b.value?.value || b.value;
  }
  return blockMap;
}

function blockToMarkdown(block, blockMap, indent = '') {
  if (!block) return '';
  const title = (block.properties?.title || []).map(t => t[0]).join('');
  const type = block.type;

  switch (type) {
    case 'header':
      return `\n${indent}# ${title}\n`;
    case 'sub_header':
      return `\n${indent}## ${title}\n`;
    case 'sub_sub_header':
      return `\n${indent}### ${title}\n`;
    case 'text':
      return title ? `${indent}${title}\n` : `\n`;
    case 'bulleted_list':
      return `${indent}* ${title}\n`;
    case 'numbered_list':
      return `${indent}1. ${title}\n`;
    case 'to_do': {
      const checked = block.properties?.checked?.[0]?.[0] === 'Yes' ? '[x]' : '[ ]';
      return `${indent}- ${checked} ${title}\n`;
    }
    case 'toggle': {
      let out = `\n<details><summary><b>${title}</b></summary>\n\n`;
      for (const cid of (block.content || [])) {
        out += blockToMarkdown(blockMap[cid], blockMap, indent + '  ');
      }
      out += `\n</details>\n`;
      return out;
    }
    case 'code': {
      const lang = block.properties?.language?.[0]?.[0] || '';
      return `\n\`\`\`${lang.toLowerCase()}\n${title}\n\`\`\`\n`;
    }
    case 'quote':
      return `\n> ${title}\n`;
    case 'callout':
      return `\n> 💡 **${title}**\n`;
    case 'divider':
      return `\n---\n`;
    case 'page':
      return `\n### 📄 하위 페이지: ${title}\n`;
    default:
      return title ? `${indent}${title}\n` : '';
  }
}

async function main() {
  console.log('1. Checking connection to target Notion page...');
  const access = await checkTargetAccess();
  console.log('Target Page Access Status:', access.status);
  if (access.status !== 200) {
    console.log('Target page message:', access.data?.message);
  }

  console.log('\n2. Fetching root public Notion page tree...');
  const rootMap = await fetchPageTree(SOURCE_PAGE_ID);
  const root = rootMap[SOURCE_PAGE_ID];
  console.log('Root title:', root?.properties?.title?.[0]?.[0]);

  let fullMarkdown = `# ${root?.properties?.title?.[0]?.[0] || '리뷰 이벤트(인프런)'}\n\n`;
  fullMarkdown += `> 출처: https://instinctive-spirit-494.notion.site/31f12a10306780389720fe577aca7758\n\n---\n\n`;

  for (const cid of (root?.content || [])) {
    const b = rootMap[cid];
    if (!b) continue;

    if (b.type === 'page') {
      const subTitle = (b.properties?.title || []).map(t => t[0]).join('');
      console.log(`\nFetching subpage: [${subTitle}] (${b.id})...`);
      fullMarkdown += `\n\n---\n\n## 📄 ${subTitle}\n\n`;

      try {
        const subMap = await fetchPageTree(b.id);
        const subRoot = subMap[b.id];
        for (const scid of (subRoot?.content || [])) {
          const sb = subMap[scid];
          if (!sb) continue;
          if (sb.type === 'page') {
            const nestedTitle = (sb.properties?.title || []).map(t => t[0]).join('');
            console.log(`  -> Nested page: [${nestedTitle}] (${sb.id})`);
            fullMarkdown += `\n### 📑 ${nestedTitle}\n\n`;
            try {
              const nestedMap = await fetchPageTree(sb.id);
              const nestedRoot = nestedMap[sb.id];
              for (const ncid of (nestedRoot?.content || [])) {
                fullMarkdown += blockToMarkdown(nestedMap[ncid], nestedMap, '');
              }
            } catch (ne) {
              console.error('    Error nested:', ne.message);
            }
          } else {
            fullMarkdown += blockToMarkdown(sb, subMap, '');
          }
        }
      } catch (err) {
        console.error('Error fetching subpage:', err.message);
      }
    } else {
      fullMarkdown += blockToMarkdown(b, rootMap, '');
    }
  }

  const outPath = path.resolve(process.cwd(), 'REVIEW_EVENT_ALL.md');
  fs.writeFileSync(outPath, fullMarkdown, 'utf8');
  console.log(`\n✅ Saved complete content to ${outPath} (${fullMarkdown.length} characters)`);

  if (access.status === 200) {
    console.log('\n🚀 Target page is connected! Starting upload to Notion...');
    await uploadToNotion(rootMap, root);
  } else {
    console.log('\n⚠️ Target page is not yet connected to integration "mcp".');
    console.log('👉 Please go to Notion -> Click [···] on top right -> [Add connections] -> Select "mcp"');
  }
}

// Convert public notion block to Notion API block format
function toNotionApiBlock(block, blockMap) {
  if (!block) return null;
  const rawTitle = (block.properties?.title || []).map(t => t[0]).join('');
  // Notion API limit: rich text content max 2000 chars
  const chunks = [];
  for (let i = 0; i < rawTitle.length; i += 1900) {
    chunks.push({ type: 'text', text: { content: rawTitle.slice(i, i + 1900) } });
  }
  if (chunks.length === 0) chunks.push({ type: 'text', text: { content: ' ' } });

  switch (block.type) {
    case 'header':
      return { object: 'block', type: 'heading_1', heading_1: { rich_text: chunks } };
    case 'sub_header':
      return { object: 'block', type: 'heading_2', heading_2: { rich_text: chunks } };
    case 'sub_sub_header':
      return { object: 'block', type: 'heading_3', heading_3: { rich_text: chunks } };
    case 'text':
      return { object: 'block', type: 'paragraph', paragraph: { rich_text: chunks } };
    case 'bulleted_list':
      return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: chunks } };
    case 'numbered_list':
      return { object: 'block', type: 'numbered_list_item', numbered_list_item: { rich_text: chunks } };
    case 'to_do':
      return {
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: chunks,
          checked: block.properties?.checked?.[0]?.[0] === 'Yes'
        }
      };
    case 'code': {
      const rawLang = (block.properties?.language?.[0]?.[0] || 'plain text').toLowerCase();
      const validLangs = [
        'abap', 'arduino', 'bash', 'basic', 'c', 'clojure', 'coffeescript', 'cpp', 'csharp', 'css',
        'dart', 'diff', 'docker', 'elixir', 'elm', 'erlang', 'flow', 'fortran', 'fsharp', 'gherkin',
        'glsl', 'go', 'graphql', 'groovy', 'haskell', 'html', 'java', 'javascript', 'json', 'julia',
        'kotlin', 'latex', 'less', 'lisp', 'livescript', 'lua', 'makefile', 'markdown', 'markup',
        'matlab', 'mermaid', 'nix', 'objective-c', 'ocaml', 'pascal', 'perl', 'php', 'plain text',
        'powershell', 'prolog', 'protobuf', 'python', 'r', 'reason', 'ruby', 'rust', 'sass', 'scala',
        'scheme', 'scss', 'shell', 'sql', 'swift', 'typescript', 'vb.net', 'verilog', 'vhdl', 'visual basic',
        'webassembly', 'xml', 'yaml', 'java/c/c++/c#'
      ];
      const lang = validLangs.includes(rawLang) ? rawLang : (rawLang === 'js' ? 'javascript' : (rawLang === 'py' ? 'python' : 'plain text'));
      return { object: 'block', type: 'code', code: { rich_text: chunks, language: lang } };
    }
    case 'quote':
      return { object: 'block', type: 'quote', quote: { rich_text: chunks } };
    case 'callout':
      return {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: chunks,
          icon: { type: 'emoji', emoji: '💡' }
        }
      };
    case 'divider':
      return { object: 'block', type: 'divider', divider: {} };
    default:
      return { object: 'block', type: 'paragraph', paragraph: { rich_text: chunks } };
  }
}

async function appendChildrenBatched(blockId, blocks) {
  for (let i = 0; i < blocks.length; i += 80) {
    const batch = blocks.slice(i, i + 80);
    const res = await callPrivateNotion('PATCH', `blocks/${blockId}/children`, { children: batch });
    if (res.status !== 200) {
      console.error(`  Batch append error at [${i}..${i + batch.length}]:`, res.data?.message || res.status);
    } else {
      console.log(`  Appended ${batch.length} blocks...`);
    }
    // Rate limit buffer
    await new Promise(r => setTimeout(r, 350));
  }
}

async function createSubPageWithContent(parentPageId, title, subMap, subRoot) {
  // 1. Create page
  const pageRes = await callPrivateNotion('POST', 'pages', {
    parent: { page_id: parentPageId },
    properties: {
      title: [{ text: { content: title.slice(0, 100) } }]
    }
  });

  if (pageRes.status !== 200) {
    console.error(`Failed to create page "${title}":`, pageRes.data?.message);
    return;
  }

  const newPageId = pageRes.data.id;
  console.log(`  -> Created page "${title}" (${newPageId})`);

  // 2. Prepare blocks
  const apiBlocks = [];
  const nestedPages = [];

  for (const cid of (subRoot?.content || [])) {
    const sb = subMap[cid];
    if (!sb) continue;

    if (sb.type === 'page') {
      const nestedTitle = (sb.properties?.title || []).map(t => t[0]).join('');
      nestedPages.push({ title: nestedTitle, id: sb.id });
    } else {
      const apiB = toNotionApiBlock(sb, subMap);
      if (apiB) apiBlocks.push(apiB);
    }
  }

  // Append blocks
  if (apiBlocks.length > 0) {
    await appendChildrenBatched(newPageId, apiBlocks);
  }

  // Handle nested pages
  for (const np of nestedPages) {
    try {
      const nestedMap = await fetchPageTree(np.id);
      const nestedRoot = nestedMap[np.id];
      await createSubPageWithContent(newPageId, np.title, nestedMap, nestedRoot);
    } catch (e) {
      console.error(`  Error creating nested page ${np.title}:`, e.message);
    }
  }
}

async function uploadToNotion(rootMap, root) {
  console.log('Uploading root blocks to Notion...');
  const rootApiBlocks = [];
  const subPagesToCreate = [];

  for (const cid of (root?.content || [])) {
    const b = rootMap[cid];
    if (!b) continue;
    if (b.type === 'page') {
      const subTitle = (b.properties?.title || []).map(t => t[0]).join('');
      subPagesToCreate.push({ id: b.id, title: subTitle });
    } else {
      const apiB = toNotionApiBlock(b, rootMap);
      if (apiB) rootApiBlocks.push(apiB);
    }
  }

  if (rootApiBlocks.length > 0) {
    await appendChildrenBatched(TARGET_PAGE_ID, rootApiBlocks);
  }

  console.log(`\nCreating ${subPagesToCreate.length} subpages...`);
  for (const sp of subPagesToCreate) {
    console.log(`\n[Subpage] Creating "${sp.title}"...`);
    const subMap = await fetchPageTree(sp.id);
    const subRoot = subMap[sp.id];
    await createSubPageWithContent(TARGET_PAGE_ID, sp.title, subMap, subRoot);
  }
  console.log('\n🎉 ALL DONE! Notion upload complete.');
}

main().catch(console.error);
