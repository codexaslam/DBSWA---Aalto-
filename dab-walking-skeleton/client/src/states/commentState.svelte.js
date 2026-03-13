export const commentState = $state({
  comments: [],
  get totalComments() {
    return this.comments.length;
  },
  addComment(comment) {
    this.comments.push(comment);
  },
});
