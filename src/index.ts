import { Dirent, Stats } from "fs"
import * as path from "path"
import * as fs from "fs/promises"

enum ContentNodeType {
  Root,
  PathInfo,
}

interface ContentNode<DataType, ChildType=never> {
  type: ContentNodeType
  data: DataType
  children: ChildType[]
}

interface PathInfoData {
  name: string
  path: string
  isFile: boolean
  isDirectory: boolean
}

type PathInfoNodeChildType = PathInfoNode

interface PathInfoNode extends ContentNode<
  PathInfoData,
  PathInfoNodeChildType
> {
  type: ContentNodeType.PathInfo
}

type RootChildType = PathInfoNode

type Root = ContentNode<{}, RootChildType>


async function main(): Promise<void> {

  const graph: Root = {
    type: ContentNodeType.Root,
    children: [await mapPathToPathInfoNode("./example")],
    data: {}
  }

  console.dir(graph, { depth: null })
}

async function mapPathToPathInfoNode(p: string): Promise<PathInfoNode> {
  const stats = await fs.lstat(p);
  const data: PathInfoData = {
    name: path.basename(p),
    path: p,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  }

  let children: PathInfoNode[] = []
  if (stats.isDirectory()) {
    const dirContent = await fs.readdir(p);

    children = await Promise.all(dirContent.map(async subPath => {
      return mapPathToPathInfoNode(path.join(p, subPath));
    }))
  }

  return {
    type: ContentNodeType.PathInfo,
    data,
    children,
  }
}


main()
  .catch(e => { console.error(e); process.exit(1) })
