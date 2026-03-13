let comments = $state([]);

const useCommentState = () => {
  if (import.meta.env.SSR) {
    comments = [];
  } else {
    const stored = localStorage?.getItem("comments");
    if (stored) {
      try {
        comments = JSON.parse(stored);
      } catch (e) {
        comments = [];
      }
    }
  }

  return {
    get count() {
      return comments.length;
    },
    get comments() {
      return comments;
    },
    add: (comment) => {
      comments.push(comment);
      if (!import.meta.env.SSR) {
        localStorage.setItem("comments", JSON.stringify(comments));
      }
    },
  };
};

export { useCommentState };
