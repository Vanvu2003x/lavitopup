import AccClient from "./Components/AccClient"

export default async function AccPage(props) {
    const searchParams = await props.searchParams
    return <AccClient gamecode={searchParams?.gamecode} />
}
