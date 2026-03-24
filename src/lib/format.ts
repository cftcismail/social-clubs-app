export function formatDate(value: string) {
    const date = new Date(value);

    return new Intl.DateTimeFormat("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}
