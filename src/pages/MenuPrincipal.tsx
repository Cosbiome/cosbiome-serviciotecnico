import Title from "antd/lib/typography/Title";
import datt from "../assets/WhatsApp Image 2021-10-30 at 1.54.53 PM.jpeg";

const MenuPrincipal = () => {
  let data = localStorage.getItem("userData");
  return (
    <div
      style={{
        justifyContent: "center",
        alignContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
      className="container pt-5 "
    >
      <div className="row">
        <Title className="text-center">
          MENU PRINCIPAL COSBIOME SERVICIO TECNICO
        </Title>
      </div>

      {data && JSON.parse(data).username === "Angel Solis" && (
        <div className="row">
          <div
            style={{
              justifyContent: "center",
              alignContent: "center",
              display: "flex",
            }}
            className="col-md-6"
          >
            <img src={datt} alt="SERVICIO" style={{ width: 250 }} />
          </div>
          <div
            style={{
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              height: "500px",
            }}
            className="col-md-6"
          >
            <p
              className="text-center"
              style={{ fontSize: 62, fontFamily: "Metal Mania" }}
            >
              {JSON.parse(data).username}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPrincipal;
