"use client";

import { handleError } from "@repo/design-system/lib/handle-error";
import { formatDate } from "@repo/lib/format";
import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type {
  FeedbackOrganizationCursor,
  GetFeedbackCompaniesResponse,
} from "@/actions/feedback-organization/list";
import { getFeedbackCompanies } from "@/actions/feedback-organization/list";
import { CompanyLogo } from "@/app/(organization)/components/company-logo";
import { ItemList } from "@/components/item-list";

export const FeedbackCompanyList = () => {
  type FeedbackCompaniesPage = {
    data: GetFeedbackCompaniesResponse;
    nextCursor: FeedbackOrganizationCursor | null;
  };

  const { data, error, fetchNextPage, isFetching, hasNextPage } =
    useInfiniteQuery<
      FeedbackCompaniesPage,
      Error,
      InfiniteData<FeedbackCompaniesPage>,
      string[],
      FeedbackOrganizationCursor | null
    >({
      queryKey: ["feedbackCompanies"],
      queryFn: async ({ pageParam }): Promise<FeedbackCompaniesPage> => {
        const response = await getFeedbackCompanies(pageParam);

        if ("error" in response) {
          throw response.error;
        }

        return response;
      },
      initialPageParam: null as FeedbackOrganizationCursor | null,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  useEffect(() => {
    if (error) {
      handleError(error.message);
    }
  }, [error]);

  return (
    <ItemList
      data={
        data?.pages.flatMap((page) =>
          page.data.map((item) => ({
            id: item.id,
            href: `/data/companies/${item.id}`,
            title: item.name,
            description: item.domain ?? "",
            caption: formatDate(new Date(item.createdAt)),
            image: (
              <CompanyLogo
                fallback={item.name.slice(0, 2)}
                size={20}
                src={item.domain}
              />
            ),
          }))
        ) ?? []
      }
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetching={isFetching}
    />
  );
};
