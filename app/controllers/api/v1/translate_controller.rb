# frozen_string_literal: true

class Api::V1::TranslateController < Api::BaseController
  include Translation

  before_action -> { doorkeeper_authorize! :read }
  before_action :require_user!

  respond_to :text, layout: false

  def index
    render json: { text: translate(params[:text], params[:to]) }
  end

end
