declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	export { z } from 'astro/zod';
	export type CollectionEntry<C extends keyof AnyEntryMap> = AnyEntryMap[C][keyof AnyEntryMap[C]];

	// TODO: Remove this when having this fallback is no longer relevant. 2.3? 3.0? - erika, 2023-04-04
	/**
	 * @deprecated
	 * `astro:content` no longer provide `image()`.
	 *
	 * Please use it through `schema`, like such:
	 * ```ts
	 * import { defineCollection, z } from "astro:content";
	 *
	 * defineCollection({
	 *   schema: ({ image }) =>
	 *     z.object({
	 *       image: image(),
	 *     }),
	 * });
	 * ```
	 */
	export const image: never;

	// This needs to be in sync with ImageMetadata
	export type ImageFunction = () => import('astro/zod').ZodObject<{
		src: import('astro/zod').ZodString;
		width: import('astro/zod').ZodNumber;
		height: import('astro/zod').ZodNumber;
		format: import('astro/zod').ZodUnion<
			[
				import('astro/zod').ZodLiteral<'png'>,
				import('astro/zod').ZodLiteral<'jpg'>,
				import('astro/zod').ZodLiteral<'jpeg'>,
				import('astro/zod').ZodLiteral<'tiff'>,
				import('astro/zod').ZodLiteral<'webp'>,
				import('astro/zod').ZodLiteral<'gif'>,
				import('astro/zod').ZodLiteral<'svg'>
			]
		>;
	}>;

	type BaseSchemaWithoutEffects =
		| import('astro/zod').AnyZodObject
		| import('astro/zod').ZodUnion<import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodDiscriminatedUnion<string, import('astro/zod').AnyZodObject[]>
		| import('astro/zod').ZodIntersection<
				import('astro/zod').AnyZodObject,
				import('astro/zod').AnyZodObject
		  >;

	type BaseSchema =
		| BaseSchemaWithoutEffects
		| import('astro/zod').ZodEffects<BaseSchemaWithoutEffects>;

	export type SchemaContext = { image: ImageFunction };

	type DataCollectionConfig<S extends BaseSchema> = {
		type: 'data';
		schema?: S | ((context: SchemaContext) => S);
	};

	type ContentCollectionConfig<S extends BaseSchema> = {
		type?: 'content';
		schema?: S | ((context: SchemaContext) => S);
	};

	type CollectionConfig<S> = ContentCollectionConfig<S> | DataCollectionConfig<S>;

	export function defineCollection<S extends BaseSchema>(
		input: CollectionConfig<S>
	): CollectionConfig<S>;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {})
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {})
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
			  }
			: {
					collection: C;
					id: keyof DataEntryMap[C];
			  }
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"blog": {
"Computer Science/Algorithm/그래프 최단경로 알고리즘 정리.md": {
	id: "Computer Science/Algorithm/그래프 최단경로 알고리즘 정리.md";
  slug: "computer-science/algorithm/그래프-최단경로-알고리즘-정리";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Algorithm/비트마스크.md": {
	id: "Computer Science/Algorithm/비트마스크.md";
  slug: "computer-science/algorithm/비트마스크";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Database/JOIN.md": {
	id: "Computer Science/Database/JOIN.md";
  slug: "computer-science/database/join";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Database/SELECT.md": {
	id: "Computer Science/Database/SELECT.md";
  slug: "computer-science/database/select";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 04 Process.md": {
	id: "Computer Science/Operating System/OSTEP 04 Process.md";
  slug: "computer-science/operating-system/ostep-04-process";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 05 Process API.md": {
	id: "Computer Science/Operating System/OSTEP 05 Process API.md";
  slug: "computer-science/operating-system/ostep-05-process-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 06 Direct Execution.md": {
	id: "Computer Science/Operating System/OSTEP 06 Direct Execution.md";
  slug: "computer-science/operating-system/ostep-06-direct-execution";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 07 CPU Scheduling.md": {
	id: "Computer Science/Operating System/OSTEP 07 CPU Scheduling.md";
  slug: "computer-science/operating-system/ostep-07-cpu-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 08 Multi-level Feedback Queue, MLFQ.md": {
	id: "Computer Science/Operating System/OSTEP 08 Multi-level Feedback Queue, MLFQ.md";
  slug: "computer-science/operating-system/ostep-08-multi-level-feedback-queue-mlfq";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 09 Lottery Scheduling.md": {
	id: "Computer Science/Operating System/OSTEP 09 Lottery Scheduling.md";
  slug: "computer-science/operating-system/ostep-09-lottery-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 10 Multi-CPU Scheduling.md": {
	id: "Computer Science/Operating System/OSTEP 10 Multi-CPU Scheduling.md";
  slug: "computer-science/operating-system/ostep-10-multi-cpu-scheduling";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 13 Address Spaces.md": {
	id: "Computer Science/Operating System/OSTEP 13 Address Spaces.md";
  slug: "computer-science/operating-system/ostep-13-address-spaces";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 14 Memory API.md": {
	id: "Computer Science/Operating System/OSTEP 14 Memory API.md";
  slug: "computer-science/operating-system/ostep-14-memory-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 15 Address Translation.md": {
	id: "Computer Science/Operating System/OSTEP 15 Address Translation.md";
  slug: "computer-science/operating-system/ostep-15-address-translation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 16 Segmentation.md": {
	id: "Computer Science/Operating System/OSTEP 16 Segmentation.md";
  slug: "computer-science/operating-system/ostep-16-segmentation";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 17 Free Space Management.md": {
	id: "Computer Science/Operating System/OSTEP 17 Free Space Management.md";
  slug: "computer-science/operating-system/ostep-17-free-space-management";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 18 Introduction to Paging.md": {
	id: "Computer Science/Operating System/OSTEP 18 Introduction to Paging.md";
  slug: "computer-science/operating-system/ostep-18-introduction-to-paging";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 19 Translation Lookaside Buffer.md": {
	id: "Computer Science/Operating System/OSTEP 19 Translation Lookaside Buffer.md";
  slug: "computer-science/operating-system/ostep-19-translation-lookaside-buffer";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 20 Advanced Page Tables.md": {
	id: "Computer Science/Operating System/OSTEP 20 Advanced Page Tables.md";
  slug: "computer-science/operating-system/ostep-20-advanced-page-tables";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 21 Swapping Mechanisms.md": {
	id: "Computer Science/Operating System/OSTEP 21 Swapping Mechanisms.md";
  slug: "computer-science/operating-system/ostep-21-swapping-mechanisms";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 22 Swapping Policies.md": {
	id: "Computer Science/Operating System/OSTEP 22 Swapping Policies.md";
  slug: "computer-science/operating-system/ostep-22-swapping-policies";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 26 Concurrency and Threads.md": {
	id: "Computer Science/Operating System/OSTEP 26 Concurrency and Threads.md";
  slug: "computer-science/operating-system/ostep-26-concurrency-and-threads";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 27 Thread API.md": {
	id: "Computer Science/Operating System/OSTEP 27 Thread API.md";
  slug: "computer-science/operating-system/ostep-27-thread-api";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 28 Locks.md": {
	id: "Computer Science/Operating System/OSTEP 28 Locks.md";
  slug: "computer-science/operating-system/ostep-28-locks";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Computer Science/Operating System/OSTEP 교재.md": {
	id: "Computer Science/Operating System/OSTEP 교재.md";
  slug: "computer-science/operating-system/ostep-교재";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/1. 아키텍팅.md": {
	id: "Development/AWS/1. 아키텍팅.md";
  slug: "development/aws/1-아키텍팅";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/10. 네트워킹 2.md": {
	id: "Development/AWS/10. 네트워킹 2.md";
  slug: "development/aws/10-네트워킹-2";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/11. 서버리스.md": {
	id: "Development/AWS/11. 서버리스.md";
  slug: "development/aws/11-서버리스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/12. 엣지 서비스.md": {
	id: "Development/AWS/12. 엣지 서비스.md";
  slug: "development/aws/12-엣지-서비스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/13. 백업 및 복구.md": {
	id: "Development/AWS/13. 백업 및 복구.md";
  slug: "development/aws/13-백업-및-복구";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/2. 계정 보안.md": {
	id: "Development/AWS/2. 계정 보안.md";
  slug: "development/aws/2-계정-보안";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/3. 네트워킹 1.md": {
	id: "Development/AWS/3. 네트워킹 1.md";
  slug: "development/aws/3-네트워킹-1";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/4. 컴퓨팅.md": {
	id: "Development/AWS/4. 컴퓨팅.md";
  slug: "development/aws/4-컴퓨팅";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/5. 스토리지.md": {
	id: "Development/AWS/5. 스토리지.md";
  slug: "development/aws/5-스토리지";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/6. 데이터베이스 서비스.md": {
	id: "Development/AWS/6. 데이터베이스 서비스.md";
  slug: "development/aws/6-데이터베이스-서비스";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/7. 모니터링 및 크기 조정.md": {
	id: "Development/AWS/7. 모니터링 및 크기 조정.md";
  slug: "development/aws/7-모니터링-및-크기-조정";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/8. 자동화.md": {
	id: "Development/AWS/8. 자동화.md";
  slug: "development/aws/8-자동화";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/AWS/9. 컨테이너.md": {
	id: "Development/AWS/9. 컨테이너.md";
  slug: "development/aws/9-컨테이너";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/JAVA/Bulk Insert.md": {
	id: "Development/JAVA/Bulk Insert.md";
  slug: "development/java/bulk-insert";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Development/JAVA/JPA.md": {
	id: "Development/JAVA/JPA.md";
  slug: "development/java/jpa";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Life/2023 새해 목표.md": {
	id: "Life/2023 새해 목표.md";
  slug: "life/2023-새해-목표";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Life/SW 마에스트로 14기 합격 후기.md": {
	id: "Life/SW 마에스트로 14기 합격 후기.md";
  slug: "life/sw-마에스트로-14기-합격-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Life/옵시디언 플러그인으로 티스토리에 글 올리기.md": {
	id: "Life/옵시디언 플러그인으로 티스토리에 글 올리기.md";
  slug: "life/옵시디언-플러그인으로-티스토리에-글-올리기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Life/전역 후기.md": {
	id: "Life/전역 후기.md";
  slug: "life/전역-후기";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"Life/티스토리 테마 복사용.md": {
	id: "Life/티스토리 테마 복사용.md";
  slug: "life/티스토리-테마-복사용";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준  2261번 가장 가까운 두 점.md": {
	id: "PS/BOJ/백준  2261번 가장 가까운 두 점.md";
  slug: "ps/boj/백준--2261번-가장-가까운-두-점";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 1062번 가르침.md": {
	id: "PS/BOJ/백준 1062번 가르침.md";
  slug: "ps/boj/백준-1062번-가르침";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 10986번 나머지 합.md": {
	id: "PS/BOJ/백준 10986번 나머지 합.md";
  slug: "ps/boj/백준-10986번-나머지-합";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 11444번 피보나치 수 6.md": {
	id: "PS/BOJ/백준 11444번 피보나치 수 6.md";
  slug: "ps/boj/백준-11444번-피보나치-수-6";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 13489번 Vještica.md": {
	id: "PS/BOJ/백준 13489번 Vještica.md";
  slug: "ps/boj/백준-13489번-vještica";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 13711번 LCS 4.md": {
	id: "PS/BOJ/백준 13711번 LCS 4.md";
  slug: "ps/boj/백준-13711번-lcs-4";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 1588번 수열.md": {
	id: "PS/BOJ/백준 1588번 수열.md";
  slug: "ps/boj/백준-1588번-수열";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 17297번 Messi Gimossi.md": {
	id: "PS/BOJ/백준 17297번 Messi Gimossi.md";
  slug: "ps/boj/백준-17297번-messi-gimossi";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 23741번 야바위 게임.md": {
	id: "PS/BOJ/백준 23741번 야바위 게임.md";
  slug: "ps/boj/백준-23741번-야바위-게임";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 24229번 모두싸인 출근길.md": {
	id: "PS/BOJ/백준 24229번 모두싸인 출근길.md";
  slug: "ps/boj/백준-24229번-모두싸인-출근길";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 25949번 Jar Game.md": {
	id: "PS/BOJ/백준 25949번 Jar Game.md";
  slug: "ps/boj/백준-25949번-jar-game";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 25953번 템포럴 그래프.md": {
	id: "PS/BOJ/백준 25953번 템포럴 그래프.md";
  slug: "ps/boj/백준-25953번-템포럴-그래프";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 2629번 양팔저울.md": {
	id: "PS/BOJ/백준 2629번 양팔저울.md";
  slug: "ps/boj/백준-2629번-양팔저울";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 27066번 나무 블럭 게임.md": {
	id: "PS/BOJ/백준 27066번 나무 블럭 게임.md";
  slug: "ps/boj/백준-27066번-나무-블럭-게임";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 27068번 이미지 보정 작업.md": {
	id: "PS/BOJ/백준 27068번 이미지 보정 작업.md";
  slug: "ps/boj/백준-27068번-이미지-보정-작업";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 9370번 미확인 도착지.md": {
	id: "PS/BOJ/백준 9370번 미확인 도착지.md";
  slug: "ps/boj/백준-9370번-미확인-도착지";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/BOJ/백준 9694번 무엇을 아느냐가 아니라 누구를 아느냐가 문제다.md": {
	id: "PS/BOJ/백준 9694번 무엇을 아느냐가 아니라 누구를 아느냐가 문제다.md";
  slug: "ps/boj/백준-9694번-무엇을-아느냐가-아니라-누구를-아느냐가-문제다";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/Programming Contest/2022 SKKU 프로그래밍 대회 in 소프트의 밤.md": {
	id: "PS/Programming Contest/2022 SKKU 프로그래밍 대회 in 소프트의 밤.md";
  slug: "ps/programming-contest/2022-skku-프로그래밍-대회-in-소프트의-밤";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
"PS/Programming Contest/2022 성균관대학교 프로그래밍 경진대회.md": {
	id: "PS/Programming Contest/2022 성균관대학교 프로그래밍 경진대회.md";
  slug: "ps/programming-contest/2022-성균관대학교-프로그래밍-경진대회";
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">
} & { render(): Render[".md"] };
};
"templates": {
"frontmatter.md": {
	id: "frontmatter.md";
  slug: "frontmatter";
  body: string;
  collection: "templates";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	type ContentConfig = typeof import("../src/content/config");
}
