import type { Comment } from '@prisma/client'
import { createCommentTree } from '../commentTree'

describe('Given a list of comments', () => {
  it('Should return a tree of comments', () => {
    const input: Comment[] = [
      {
        id: 1,
        parentId: null,
        postId: 10,
        content: 'testPost',
        authorId: 3,
        createdAt: new Date()
      },
      { // this is a reply of the above comment
        id: 2,
        parentId: 1,
        postId: 10,
        content: 'testPost',
        authorId: 3,
        createdAt: new Date()
      }
    ]
    const tree = createCommentTree(input)
    expect(tree[0]).toBeDefined()
    expect(tree[0].replies[0]).toHaveProperty('id', input[1].id)
  })
})
