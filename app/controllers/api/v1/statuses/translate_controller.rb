# frozen_string_literal: true

class Api::V1::Statuses::TranslateController < Api::BaseController
  include Translation

  before_action -> { doorkeeper_authorize! :read }
  before_action :require_user!

  respond_to :json

  def index
    @status = requested_status

    @status.text << "\n" + translate(@status.text, I18n.locale || 'ja')

    render json: @status, serializer: REST::StatusSerializer
  end

  private

  def requested_status
    Status.find(params[:status_id])
  end
end
