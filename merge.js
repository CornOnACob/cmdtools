const args = Deno.args;
if (args.length < 1) {
    console.error("Usage: deno run --allow-net script.js <TOKEN>");
    Deno.exit(1);
}

const owner = "CornOnACob";
const repo = "cmds";
const filePath = "cmds.json";
const token = args[0];

const localAppData = Deno.env.get("LOCALAPPDATA");

async function readGitHubFile(owner, repo, path, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`
        }
      });
  
      if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
      }
  
      const data = await response.json();
      const content = atob(data.content);
      const jsonObject = JSON.parse(content);
      for (let i = 0; i < jsonObject.commands.length; i++) {
        const newAction = {};
        newAction.command = {};
        newAction.command.action = "sendInput";
        newAction.command.input = jsonObject.commands[i].input;
        newAction.name = jsonObject.commands[i].name;
        jsonObject.actions.push(newAction);
      }
      const filename = `${localAppData}\\Packages\\Microsoft.WindowsTerminal_8wekyb3d8bbwe\\LocalState\\settings.json`;
      const fileContents = await Deno.readTextFile(filename);
      const newJsonData = JSON.parse(fileContents);
      newJsonData.actions = jsonObject.actions;
      const newContents = JSON.stringify(newJsonData, null, 2);
      await Deno.writeTextFile(filename, newContents);
    } catch (error) {
      console.error('Error reading file:', error.message);
    }
  }
  
readGitHubFile(owner, repo, filePath, token);
