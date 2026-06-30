# ON.IPVC-v3-Sveltekit
 Repositório da versão do ON.IPVC 3, desenvolvida em SvelteKit

# Install Dependencies 
```npm i --force```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Configurar .env para apontar para links corretos (links de desenvolvimento passam a links de produção) (ou é criado um .env manualmente no servidor onde a build é publicada? verificar...)

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.


## Issue and Branch Organization

### Branch Structure

<p align="center">
  <img src="./readme-assets/branch-scheme.png"  alt="branch-scheme.png"/>
</p>

#### 1. **Master Branch**
The `master` branch is the main branch that contains the entire codebase and serves as the base for all development.

#### 2. **Module Branches**
For each module currently under development, we create a dedicated branch. These branches are children of the `master` branch and contain all the code for their respective modules. The naming convention for these branches is:

Example:
- `module-identification-cards`
- `module-ugp`

#### 3. **Issue/Task Branches**
For each issue or task related to a specific module, a branch is created as a child of the corresponding module branch. These branches focus on implementing features, fixing bugs, or addressing specific tasks for the module. The naming convention for these branches is:

Example:
- `module-identification-cards-issue-1`
- `module-ugp-issue-2`

### Development Flow

1. Identify the module related to the task and ensure its branch exists (e.g., `module-name`).
2. Create a new issue for the task and tag it with the appropriate labels (e.g., Bug, Enhancement, or module-specific labels like Module identification-cards).
3. Create a branch for the task using the naming convention: `module-name-issue-#id`.
4. Move task to `in-progress` column.
5. Implement the required changes in the new branch.
6. When the task is complete, open a pull request to merge the issue branch into the corresponding module branch and assign a reviewer.
7. Move task to `testing` column.
8. Once all tasks for a module are complete and tested, open a pull request to merge the module branch into master.
