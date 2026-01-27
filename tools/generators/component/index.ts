import { Tree, formatFiles, generateFiles, names, readProjectConfiguration } from '@nx/devkit';
import * as path from 'path';

interface Schema {
    name: string;
    project: string;
    directory?: string;
    withStorybook: boolean;
}

export default async function (tree: Tree, schema: Schema) {
    const normalizedNames = names(schema.name);
    const projectConfig = readProjectConfiguration(tree, schema.project);
    const projectRoot = projectConfig.sourceRoot || `apps/${schema.project}/src`;

    const componentDir = schema.directory
        ? path.join(projectRoot, 'components', schema.directory, normalizedNames.className)
        : path.join(projectRoot, 'components', normalizedNames.className);

    generateFiles(
        tree,
        path.join(__dirname, 'files'),
        componentDir,
        {
            ...schema,
            ...normalizedNames,
            tmpl: '',
        }
    );

    await formatFiles(tree);
}
