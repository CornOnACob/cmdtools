const args = Deno.args;
if (args.length < 1) {
    console.error("Usage: deno run --allow-net script.js <TOKEN>");
    Deno.exit(1);
}

import { Select } from "https://deno.land/x/cliffy/prompt/select.ts";

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
  const searchQuery = prompt("Search:");
  const fileData = await fetchFile();
  const decodedContent = atob(fileData.content);
  const json = JSON.parse(decodedContent);
  const options = [];
  for (let i = 0; i < json.commands.length; i++) {
    if (json.commands[i].name.toLowerCase().includes(searchQuery.toLowerCase()) || json.commands[i].input.toLowerCase().includes(searchQuery.toLowerCase())) {
        const opt = {};
        opt.name = `[${i}] ${json.commands[i].name}: ${json.commands[i].input}`;
        opt.value = i;
        options.push(opt);
    }
  }
  const choice = await Select.prompt({
    message: "Which command to edit?",
    options,
  });
  console.log(choice);
  console.log(typeof(choice));
  const editName = await Select.prompt({
    message: "Edit name or input?",
    options: [
        { name: "Name", value: true },
        { name: "Input", value: false },
    ]
  });
  console.log("Edit name: " + editName);
  const defaultVal = editName ? json.commands[choice].name : json.commands[choice].input;
  const newVal = prompt("New value:", defaultVal);
  console.log(newVal);
  if (editName) {
    json.commands[choice].name = newVal;
  }
  else {
    json.commands[choice].input = newVal;
  }
  const newContent = JSON.stringify(json, null, 2);
  const encodedContent = btoa(newContent);
  await updateFile(encodedContent, fileData.sha);
  console.log("File updated successfully!");
}

main().catch(console.error);
