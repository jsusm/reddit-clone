import type { Comment } from '@prisma/client'

type CommentTree = Comment & {
  replies: CommentTree[]
}

export type CommentList = CommentTree[]

/** Build a tree based on parentId property
 * This operation could be slow
 */
export function createCommentTree (comments: Comment[]): CommentList {
  const out: CommentList = []
  for (const c of comments) {
    if (c.parentId === null) {
      out.push(resolveBranches(c, comments))
    }
  }
  return out
}

/** Insert comments wich has root as parent
 */
function resolveBranches (root: Comment, comments: Comment[]): CommentTree {
  const out: CommentTree = { ...root, replies: [] }
  for (const c of comments) {
    if (c.parentId === root.id) {
      out.replies.push(resolveBranches(c, comments))
    }
  }
  return out
}
