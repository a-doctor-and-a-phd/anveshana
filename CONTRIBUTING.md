# Contributing to Anveshana

## Quickest way to add content (works from the GitHub mobile app)

1. Open the repository on GitHub.
2. Tap **Issues** → **New Issue**.
3. Choose **New Post** or **New Question** — you'll get a short form with fields for title, author, tags, and body.
4. Fill in the form and submit. A bot will create the correctly-named file and commit it within about a minute. It will comment on the issue with the live URL, then close the issue.

That's it. No file naming, no front-matter to type by hand.

## Content schema

### Posts (`_posts/`)
| Field    | Required | Example |
|----------|----------|---------|
| `title`  | yes      | `"Geology of the Grand Canyon"` |
| `date`   | yes      | `2025-04-04` |
| `author` | yes      | `mr` or `hr` (see Authors below) |
| `tags`   | yes      | `[geology, earth]` |

### Questions (`_questions/`)
| Field          | Required | Values |
|----------------|----------|--------|
| `title`        | yes      | The question as a sentence |
| `date`         | yes      | `2025-04-10` |
| `author`       | yes      | `mr` or `hr` |
| `status`       | yes      | `open`, `in-progress`, `answered` |
| `priority`     | yes      | `high`, `medium`, `low` |
| `related_tags` | yes      | `[nature, birds]` |
| `related_post` | no       | Path to the post that sparked the question, e.g. `_posts/2025-04-04-geology-grand-canyon.md` |

### Authors
| Display name | ID |
|--------------|----|
| Mythreyi     | `mr` |
| Harshita     | `hr` |

## Linking a post that answers a question

When you write a post that answers an open question:

1. Add `question_ref: _questions/YYYY-MM-DD-slug.md` to the post's front matter (the question's file path).
2. Update the question's `status` to `answered` (use the **Update Status** button on the question page — it copies the updated front matter to your clipboard, then edit the question file on GitHub).

The question page will automatically show a link to the answer post.

## Fallback: manual file creation

If the issue form isn't available, you can create files by hand using the **+** buttons on the home page or the **Add a Question** / **Add an Answer** buttons on post/question pages. These copy a pre-filled template to your clipboard. Then:

1. In the GitHub mobile app, navigate to `_posts/` or `_questions/`.
2. Tap the **+** / Add file button.
3. Name the file exactly `YYYY-MM-DD-slug.md` (e.g. `2025-06-29-how-do-glaciers-form.md`).
4. Paste the clipboard content and commit.

A validation check will flag filename/front-matter problems automatically when you push.
