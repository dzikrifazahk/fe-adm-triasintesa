export function findIdInTree(tree: any[], targetId: string): boolean {
  for (const item of tree) {
    if (item.id === targetId) {
      return true;
    }
    if (
      item.children?.length &&
      findIdInTree(item.children, targetId)
    ) {
      return true;
    }
  }
  return false;
}
