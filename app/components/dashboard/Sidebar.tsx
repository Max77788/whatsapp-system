"use client";

import React from "react";

const Sidebar = ({ withKbBaseUrlLink = true }: { withKbBaseUrlLink?: boolean }) => {
  const linkStyle =
    "flex items-center p-3 rounded-lg transition-colors";
  const activeLinkStyle =
    "bg-white hover:bg-gray-100";
  const disabledLinkStyle =
    "bg-gray-300 cursor-not-allowed opacity-50";

  return (
    <div className="w-200 p-5 bg-black mb-2 mt-2 rounded-lg">
      <div className="flex items-center mb-8">
        <svg
          className="w-8 h-8 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <a href="/dashboard" className="no-underline">
          <h2 className="text-xl text-white font-bold">WhatsLeads</h2>
        </a>
      </div>
      <nav>
        <ul className="space-y-4">
          <li>
            <a
              href="/dashboard"
              className={`${linkStyle} ${activeLinkStyle}`}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/profile" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
              Profile
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/accounts" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V5a1 1 0 00-1-1H9a1 1 0 00-1 1v6M5 20h14a1 1 0 001-1v-7H4v7a1 1 0 001 1z"
                />
              </svg>
              Accounts
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/leads" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h18v18H3V3zm2 2v14h14V5H5zm4 4h6v2H9V9zm0 4h6v2H9v-2z"
                />
              </svg>
              Leads | CRM
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/start-campaign" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2C10.343 2 9 3.343 9 5c0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 4c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm0 2c-2.21 0-4 1.79-4 4 0 1.657 1.343 3 3 3s3-1.343 3-3c0-2.21-1.79-4-4-4zm0 6c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3z"
                />
              </svg>
              Start Campaign
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/chatbot-setup" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2a3 3 0 00-3 3v1H8a1 1 0 00-1 1v2a1 1 0 001 1h1v1a3 3 0 006 0v-1h1a1 1 0 001-1V7a1 1 0 00-1-1h-1V5a3 3 0 00-3-3zm-1 5h2v2h-2V7zm-3 4h8v1a1 1 0 01-1 1h-6a1 1 0 01-1-1v-1z"
                />
              </svg>
              Chatbot
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/send-message" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.5 19.5L21 12 2.5 4.5 2.5 10.5 17 12 2.5 13.5z"
                />
              </svg>
              Send Message
            </a>
          </li>
          <li>
            <a
              href={withKbBaseUrlLink ? "/webhooks-setup" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                />
              </svg>
              Webhooks
            </a>
          </li>
          <hr></hr>
          <li>
            <a
              href={withKbBaseUrlLink ? "/whatsapp-screen" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.11 1.52 5.85L0 24l6.15-1.52A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.18-1.23-6.09-3.48-8.52zM12 22c-1.85 0-3.58-.5-5.08-1.37L2 22l1.37-4.92C2.5 15.58 2 13.85 2 12 2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1.2-6.4c-2.2 0-4.2-1.2-5.4-3.2-.2-.3-.2-.7 0-1l1.2-1.6c.2-.3.5-.4.8-.3l1.8.7c.3.1.6 0 .8-.2l.8-1c.2-.3.1-.6-.1-.8l-1.2-1.2c-.2-.2-.3-.5-.2-.8l.4-1.8c.1-.3.3-.6.6-.7l1.6-1.2c.3-.2.7-.2 1 0 2 1.2 3.2 3.2 3.2 5.4 0 3.6-2.8 6.4-6.4 6.4z" />
              </svg>
              Whatsapp Screen
            </a>
          </li>
          <hr></hr>
          <li>
            <a
              href={withKbBaseUrlLink ? "http://docs.mom-ai-restaurant.lat" : "#"}
              className={`${linkStyle} ${
                withKbBaseUrlLink ? activeLinkStyle : disabledLinkStyle
              }`}
              onClick={(e) => {
                if (!withKbBaseUrlLink) e.preventDefault();
              }}
              target="_blank"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M21 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h1V4h-1zm-2 0H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12V4zm-2 2v12H7V6h10zM3 4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h1V4H3z" />
              </svg>
              Docs
            </a>
          </li>
        </ul>
      </nav>
      {!withKbBaseUrlLink ? (<p className="text-white text-center mt-5">Please, reload the page<br></br>in 1 minute</p>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Sidebar;
