const args = Deno.args;
if (args.length < 1) {
    console.error("Usage: deno run --allow-net script.js <TOKEN>");
    Deno.exit(1);
}

const token = args[0];
const owner = 'CornOnACob';
const repo = 'cmds';
const path = 'cmds.json';

const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

async function fetchFile() {
    const response = await fetch(apiUrl, {
        headers: { "Authorization": `token ${token}` }
    });
    const data = await response.json();
    return data;
}

async function updateFile(encodedContent, sha) {
  const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          message: "Update file with new command",
          content: encodedContent,
          sha: sha
      })
  });
  const data = await response.json();
  return data;
}

async function main() {
  const newName = prompt("Name:");
  const newInput = prompt("Input:");
  const newCommand = {};
  newCommand.name = newName;
  newCommand.input = newInput;
  const fileData = await fetchFile();
  const decodedContent = atob(fileData.content);
  const json = JSON.parse(decodedContent);

  if (!json.commands) {
      json.commands = [];
  }
  json.commands.push(newCommand);

  const newContent = JSON.stringify(json, null, 2);

  const encodedContent = btoa(newContent);

  await updateFile(encodedContent, fileData.sha);
  console.log("File updated successfully!");
}

main().catch(console.error);
