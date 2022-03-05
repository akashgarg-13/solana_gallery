import './App.css';
import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getParsedNftAccountsByOwner, isValidSolanaAddress, createConnectionConfig, } from "@nfteyez/sol-rayz";
import { Col, Row, Button, Form, Card } from "react-bootstrap";
import AlertDismissible from './alert/alertDismissible';

function App(props) {
  const { publicKey } = useWallet();
  const { connection } = props;

  const inputRef = useRef();

  const [nfts, setNfts] = useState([]);

  //alert props
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setNfts([]);
    setShow(false);
  }, [publicKey, connection]);

  const getNfts = async (e) => {
    e.preventDefault();

    let address = inputRef.current.value;

    if (address.length === 0) {
      address = publicKey;
    }

    if (!isValidSolanaAddress(address)) {
      setTitle("Invalid address");
      setMessage("Please enter a valid Solana address or Connect your wallet");
      setShow(true);
      return;
    }

    const connect = createConnectionConfig(connection);

    const nftArray = await getParsedNftAccountsByOwner({
      publicAddress: address,
      connection: connect,
      serialization: true,
    });

    if (nftArray.length === 0) {
      setTitle("No NFTs found in " + props.title);
      setMessage("No NFTs found for address: " + address);
      setShow(true);
      return;
    }

    const metadatas = await fetchMetadata(nftArray);
    return setNfts(metadatas);
  };

  const fetchMetadata = async (nftArray) => {
    let metadatas = [];
    for (const nft of nftArray) {
      await fetch(nft.data.uri)
        .then((response) => response.json())
        .then((meta) => {
          metadatas.push(meta);
        });
    }
    return metadatas;
  };

  return (
    <div className="main">
      <Row className="inputForm">
        <Col lg="2"></Col>
        <Col xs="12" md="12" lg="5">
          <Form.Control
            type="text"
            ref={inputRef}
            placeholder="Wallet address"
          />
        </Col>
        <Col xs="12" md="12" lg="3" className="d-grid">
          <Button
            variant={props.variant.toLowerCase()}
            type="submit"
            onClick={getNfts}
          >
            {" "}
            Get NFTs from {props.title}{" "}
          </Button>
        </Col>

        <Col lg="2"></Col>
      </Row>

      <Row>
        {nfts.map((metadata, index) => (
          <Col xs="12" md="12" lg="3">
            <Card className="imageGrid" lg="3" key={index} style={{width:"100%"}}>
              <Card.Img
                variant="top"
                src={metadata?.image}
                alt={metadata?.name}
              />
              <Card.Body>
                <Card.Title>{metadata?.name}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {show && (
        <AlertDismissible title={title} message={message} setShow={setShow} />
      )}
    </div>
  );
}

export default App;
