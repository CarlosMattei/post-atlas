import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/app/components/post-detail";
import { getPostById } from "@/app/lib/queries";

export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/posts/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  return {
    title: post ? `${post.title} · Post Atlas` : "Post não encontrado · Post Atlas",
  };
}

export default async function PostDetailPage({
  params,
}: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  return <PostDetail post={post} />;
}
